#!/bin/bash

peg up elasticsearch-nodes.yml

peg fetch elasticsearch-cluster-ahmed

peg install elasticsearch-cluster-ahmed ssh
peg install elasticsearch-cluster-ahmed aws
peg install elasticsearch-cluster-ahmed elasticsearch
