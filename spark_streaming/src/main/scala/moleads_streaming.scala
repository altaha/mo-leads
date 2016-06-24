import kafka.serializer.StringDecoder
import java.util.Date
import org.apache.spark.streaming._
import org.apache.spark.streaming.kafka._
import org.apache.spark.SparkConf
import org.apache.spark.rdd.RDD
import org.apache.spark.SparkContext

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
        val sparkContext = ssc.sparkContext

        // Get stop words list and create broadcast variable
        val stopWords = getStopWordsSet();
        val broadcastStopWords = sparkContext.broadcast(stopWords)

        // Create direct kafka stream with brokers and topics
        val topicsSet = kafkaTopics.split(",").toSet
        val kafkaParams = Map[String, String]("metadata.broker.list" -> kafkaBroker)
        val messages = KafkaUtils.createDirectStream[String, String, StringDecoder, StringDecoder](ssc, kafkaParams, topicsSet).map(_._2)

        // parse the json records
        val adjacencyDStream = messages.map(
            JsonMethods.parse(_).asInstanceOf[JObject]
        ).map(json => {
            implicit val formats = DefaultFormats
            val id = (json \ "payment_id").extractOpt[Long].getOrElse(0L)
            val time = (json \ "created_time").extractOpt[String].getOrElse("")
            val message = (json \ "message").extractOpt[String].getOrElse("")
            val actor_id = (json \ "actor" \ "id").extractOpt[String].getOrElse("")
            val actor_name = (json \ "actor" \ "name").extractOpt[String].getOrElse("")
            val target_id = (json \\ "target" \ "id").extractOpt[String].getOrElse("")
            val target_name = (json \\ "target" \ "name").extractOpt[String].getOrElse("")
            ActorTargetAdjacency(id, time, message, actor_id, actor_name, target_id, target_name)
        }).filter(_.isValid)
        //adjacencyDStream.print(2)

        // save to Cassandra
        adjacencyDStream.foreachRDD{rdd =>
            rdd.saveToCassandra("moleads","adjacency",
                SomeColumns("id", "time", "message", "actor_id", "actor_name", "target_id", "target_name")
            )
        }
        // save to ElasticSearch
        adjacencyDStream.foreachRDD{rdd =>
            rdd.saveToEs("moleads/payment")
        }

        // get micro batch word counts and save to Cassandra
        val words = adjacencyDStream.map(_.message).flatMap(
            _.replaceAll("[^a-zA-Z]", " ").split(" ")
        ).map(_.trim).filter(_.length > 2).map(_.toLowerCase).filter(
            !broadcastStopWords.value.contains(_)
        )
        val pairs = words.map(word => (word, 1))
        val wordCounts = pairs.reduceByKey(_ + _).filter(_._2 > 2)
        wordCounts.foreachRDD{ (rdd, time) =>
            val timeDate = new Date(time.milliseconds)
            rdd.map(
                wordCountPair => (Map(wordCountPair._1 -> wordCountPair._2), "seconds", timeDate)
            ).saveToCassandra("moleads", "word_counts",
                SomeColumns("word_count" append, "period", "time")
            )
        }
        //wordCounts.print()

        // Start the stream computation
        ssc.start()
        ssc.awaitTermination()
    }


    def getStopWordsSet() : Set[String] = {
        Set("a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", "cannot", "could", "couldnt", "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", "each", "few", "for", "from", "further", "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "hed", "hell", "hes", "her", "here", "heres", "hers", "herself", "him", "himself", "his", "how", "hows", "i", "id", "ill", "im", "ive", "if", "in", "into", "is", "isnt", "it", "its", "its", "itself", "let's", "me", "more", "most", "mustnt", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shant", "she", "shed", "shell", "shes", "should", "shouldnt", "so", "some", "such", "than", "that", "thats", "the", "their", "theirs", "them", "themselves", "then", "there", "theres", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasnt", "we", "were", "werent", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "wont", "would", "wouldnt", "you", "youd", "your", "yours", "yourself", "yourselves")
    }
}


case class ActorTargetAdjacency(
    id: Long, time: String, message: String, actor_id: String, actor_name: String, target_id: String, target_name: String
) {
    def isValid = {
        id != 0L && time != "" && message != "" && actor_id != "" && target_id != ""
    }
}
