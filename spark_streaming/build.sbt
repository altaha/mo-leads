name := "mo_leads"

version := "1.0"

scalaVersion := "2.10.4"

libraryDependencies ++= Seq(
"com.datastax.spark" %% "spark-cassandra-connector" % "1.6.0",
"org.apache.spark" %% "spark-core" % "1.6.1" % "provided",
"org.apache.spark" %% "spark-sql" % "1.6.1" % "provided",
"org.apache.spark" % "spark-streaming_2.10" % "1.6.1" % "provided",
"org.apache.spark" % "spark-streaming-kafka_2.10" % "1.6.1",
"org.elasticsearch" % "elasticsearch-hadoop" % "2.3.2"
)

mergeStrategy in assembly := {
  case m if m.toLowerCase.endsWith("manifest.mf")          => MergeStrategy.discard
  case m if m.toLowerCase.matches("meta-inf.*\\.sf$")      => MergeStrategy.discard
  case "log4j.properties"                                  => MergeStrategy.discard
  case m if m.toLowerCase.startsWith("meta-inf/services/") => MergeStrategy.filterDistinctLines
  case "reference.conf"                                    => MergeStrategy.concat
  case _                                                   => MergeStrategy.first
}

resolvers += "clojars" at "https://clojars.org/repo"
resolvers += "conjars.org" at "http://conjars.org/repo"
