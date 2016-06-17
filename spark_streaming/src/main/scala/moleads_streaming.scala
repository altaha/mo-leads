import kafka.serializer.StringDecoder
import org.apache.spark.streaming._
import org.apache.spark.streaming.kafka._
import org.apache.spark.SparkConf
import org.apache.spark.rdd.RDD
import org.apache.spark.SparkContext
import org.apache.spark.sql._

import org.elasticsearch.spark._
import com.datastax.spark.connector._
import com.datastax.spark.connector.streaming._
import com.datastax.driver.core.utils._
import org.json4s._
import org.json4s.jackson.JsonMethods


object MoLeadsStreaming {

    val kafkaBroker = "ec2-52-41-59-147.us-west-2.compute.amazonaws.com:9092"
    val kafkaTopics = "venmo-data"
    val elasticsearchUrl = "ec2-52-41-104-228.us-west-2.compute.amazonaws.com"
    val cassandraHost = "ec2-52-10-45-242.us-west-2.compute.amazonaws.com"

    def main(args: Array[String]) {

        // Create context with 1 second batch interval
        val sparkConf = new SparkConf().setAppName("mo_leads")
        sparkConf.set("es.index.auto.create", "true")
                 .set("es.nodes", elasticsearchUrl)
                 .set("es.mapping.id", "id")
                 .set("spark.cassandra.connection.host", cassandraHost)

        val ssc = new StreamingContext(sparkConf, Seconds(2))

        // Create direct kafka stream with brokers and topics
        val topicsSet = kafkaTopics.split(",").toSet
        val kafkaParams = Map[String, String]("metadata.broker.list" -> kafkaBroker)
        val messages = KafkaUtils.createDirectStream[String, String, StringDecoder, StringDecoder](ssc, kafkaParams, topicsSet).map(_._2)

        val adjacencyRDD = messages.map(
            JsonMethods.parse(_).asInstanceOf[JObject]
        ).map(json => {
            implicit val formats = DefaultFormats
            val id = (json \ "payment_id").extract[Long]
            val time = (json \ "created_time").extract[String]
            val message = (json \ "message").extract[String]
            val actor_id = (json \ "actor" \ "id").extract[String]
            val actor_name = (json \ "actor" \ "name").extract[String]
            val target_id = (json \\ "target" \ "id").extract[String]
            val target_name = (json \\ "target" \ "name").extract[String]
            ActorTargetAdjacency(id, time, message, actor_id, actor_name, target_id, target_name)
        })
        //adjacencyRDD.print(2)

        adjacencyRDD.foreachRDD{rdd =>
            if (rdd.toLocalIterator.nonEmpty) {
                rdd.saveToCassandra("moleads","adjacency",
                    SomeColumns("id", "time", "message", "actor_id", "actor_name", "target_id", "target_name")
                )
                rdd.saveToEs("moleads/payment")
            }
        }

        // Start the stream computation
        ssc.start()
        ssc.awaitTermination()
    }
}


case class ActorTargetAdjacency(
    id: Long, time: String, message: String, actor_id: String, actor_name: String, target_id: String, target_name: String
)


/** Lazily instantiated singleton instance of SQLContext */
object SQLContextSingleton {

    @transient  private var instance: SQLContext = _

    def getInstance(sparkContext: SparkContext): SQLContext = {
        if (instance == null) {
            instance = new SQLContext(sparkContext)
        }
        instance
    }
}
