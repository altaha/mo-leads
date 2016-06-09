#!/bin/bash

# Launch instances on AWS
peg up producer-cluster.yml

# Store cluster information
peg fetch producer-cluster-ahmed

# Enable passwordless SSH
peg install producer-cluster-ahmed ssh
peg install producer-cluster-ahmed aws
