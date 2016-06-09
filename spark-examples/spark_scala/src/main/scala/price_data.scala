import kafka.serializer.StringDecoder
import org.apache.spark.streaming._
import org.apache.spark.streaming.kafka._
import org.apache.spark.SparkConf
import org.apache.spark.rdd.RDD
import org.apache.spark.SparkContext
import org.apache.spark.sql._

import org.elasticsearch.spark._


object PriceDataStreaming {

  def main(args: Array[String]) {

    val brokers = "ec2-52-41-8-111.us-west-2.compute.amazonaws.com:9092"
    val topics = "price_data_part4"
    val elasticsearchUrl = "ec2-52-40-68-150.us-west-2.compute.amazonaws.com"

    val topicsSet = topics.split(",").toSet

    // Create context with 2 second batch interval
    val sparkConf = new SparkConf().setAppName("price_data")
    sparkConf.set("es.index.auto.create", "true")
             .set("es.nodes", elasticsearchUrl)

    val ssc = new StreamingContext(sparkConf, Seconds(2))

    // Create direct kafka stream with brokers and topics
    val kafkaParams = Map[String, String]("metadata.broker.list" -> brokers)
    val messages = KafkaUtils.createDirectStream[String, String, StringDecoder, StringDecoder](ssc, kafkaParams, topicsSet).map(_._2)


    messages.foreachRDD { rdd =>
      // write to ElasticSearch
      rdd.saveJsonToEs("spark/json")

      val sqlContext = SQLContextSingleton.getInstance(rdd.sparkContext)

      import sqlContext.implicits._

      val df = sqlContext.jsonRDD(rdd)
      df.show()
    }

    // Start the computation
    ssc.start()
    ssc.awaitTermination()
  }
}


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
