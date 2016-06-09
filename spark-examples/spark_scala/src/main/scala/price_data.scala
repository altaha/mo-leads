import kafka.serializer.StringDecoder

import org.apache.spark.streaming._

import org.apache.spark.streaming.kafka._

import org.apache.spark.SparkConf

import org.apache.spark.rdd.RDD

import org.apache.spark.SparkContext

import org.apache.spark.sql._

object PriceDataStreaming {

  def main(args: Array[String]) {

    val brokers = "ec2-52-41-8-111.us-west-2.compute.amazonaws.com:9092"

    val topics = "price_data_part4"

    val topicsSet = topics.split(",").toSet

    // Create context with 2 second batch interval

    val sparkConf = new SparkConf().setAppName("price_data")

    val ssc = new StreamingContext(sparkConf, Seconds(2))

    // Create direct kafka stream with brokers and topics

    val kafkaParams = Map[String, String]("metadata.broker.list" -> brokers)

    val messages = KafkaUtils.createDirectStream[String, String, StringDecoder, StringDecoder](ssc, kafkaParams, topicsSet)

    // Get the lines and show results

    messages.foreachRDD { rdd =>

        val sqlContext = SQLContextSingleton.getInstance(rdd.sparkContext)

        import sqlContext.implicits._

        val lines = rdd.map(_._2)

        val ticksDF = lines.map( x => {

                                  val tokens = x.split(";")

                                  Tick(tokens(0), tokens(2).toDouble, tokens(3).toInt)}).toDF()

        val ticks_per_source_DF = ticksDF.groupBy("source")

                                .agg("price" -> "avg", "volume" -> "sum")

                                .orderBy("source")

        ticks_per_source_DF.show()

    }

    // Start the computation

    ssc.start()

    ssc.awaitTermination()

  }

}

case class Tick(source: String, price: Double, volume: Int)

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
