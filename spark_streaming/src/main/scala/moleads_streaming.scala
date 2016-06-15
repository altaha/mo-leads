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


object MoLeadsStreaming {

    val kafkaBroker = "ec2-52-41-59-147.us-west-2.compute.amazonaws.com:9092"
    val kafkaTopics = "test"
    val elasticsearchUrl = "ec2-52-41-104-228.us-west-2.compute.amazonaws.com"
    val cassandraHost = "ec2-52-10-45-242.us-west-2.compute.amazonaws.com"

    def main(args: Array[String]) {

        // Create context with 1 second batch interval
        val sparkConf = new SparkConf().setAppName("mo_leads")
        sparkConf.set("es.index.auto.create", "true")
                 .set("es.nodes", elasticsearchUrl)
                 .set("spark.cassandra.connection.host", cassandraHost)

        val ssc = new StreamingContext(sparkConf, Seconds(1))

        // Create direct kafka stream with brokers and topics
        val topicsSet = kafkaTopics.split(",").toSet
        val kafkaParams = Map[String, String]("metadata.broker.list" -> kafkaBroker,
                                              "auto.offset.reset" -> "smallest")
        val messages = KafkaUtils.createDirectStream[String, String, StringDecoder, StringDecoder](ssc, kafkaParams, topicsSet).map(_._2)

        messages.foreachRDD { rdd =>
            if (rdd.toLocalIterator.nonEmpty) {
                // write to ElasticSearch
                rdd.saveJsonToEs("spark/json")

                val sqlContext = SQLContextSingleton.getInstance(rdd.sparkContext)
                import sqlContext.implicits._

                val dataFrame = sqlContext.jsonRDD(rdd)
                dataFrame.registerTempTable("payments")

                sqlContext.sql("SELECT payment_id as id, created_time as time, message, actor.id as actor_id, actor.name as actor_name, transactions[0].target.id as target_id, transactions[0].target.name as target_name FROM payments")
                    .map{ case Row(id: Long, time: String, message: String,
                                   actor_id: String, actor_name: String,
                                   target_id: String, target_name: String
                               ) =>
                               ActorTargetAdjacency(id, time, message, actor_id, actor_name, target_id, target_name)
                    }.saveToCassandra("moleads","adjacency",
                        SomeColumns("id", "time", "message", "actor_id", "actor_name", "target_id", "target_name")
                    )
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
