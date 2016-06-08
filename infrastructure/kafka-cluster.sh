#!/bin/bash

# Launch instances on AWS
peg up kafka-cluster.yml

# Store cluster information
peg fetch kafka-cluster-ahmed

# Enable passwordless SSH and install Zookeeper and Kafka
peg install kafka-cluster-ahmed ssh
peg install kafka-cluster-ahmed aws
peg install kafka-cluster-ahmed zookeeper
peg install kafka-cluster-ahmed kafka
peg install kafka-cluster-ahmed kafka-manager
