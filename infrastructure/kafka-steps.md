# run deploy script
./kafka-cluster.sh

# start zookeeper
`peg service kafka-cluster-ahmed zookeeper start`
# start kafka
`peg service kafka-cluster-ahmed kafka start`
# start kafka manager
`peg service kafka-cluster-ahmed kafka-manager start`

# create kafka topic
peg ssh kafka-cluster-ahmed 1
/usr/local/kafka/bin/kafka-topics.sh --create --zookeeper localhost:2181 --topic venmo-data --partitions 3 --replication-factor 2
