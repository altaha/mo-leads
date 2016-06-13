#!/bin/bash

# Launch instances on AWS
peg up spark-namenode.yml
peg up spark-datanodes.yml

# Store cluster information
peg fetch spark-cluster-ahmed

# Enable passwordless SSH and install Hadoop, Spark
peg install spark-cluster-ahmed ssh
peg install spark-cluster-ahmed aws
peg install spark-cluster-ahmed hadoop
peg install spark-cluster-ahmed spark
