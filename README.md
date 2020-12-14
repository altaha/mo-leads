For Mila Reviewers: All my recent work is closed source. This is a sample from a previous project to demonstrate general coding and software skills, though not strictly AI related.

# Mo Leads
Real-time data pipeling for Mining Sales leads from Venmo transactions

[Video demo](https://www.youtube.com/watch?v=9nHyXeSqYko)

![alt tag](https://raw.githubusercontent.com/altaha/mo-leads/master/webapp/app/frontend/public/static/images/moleads_screenshot.png)


## Motivation
The motivation of this project is to discover leads related to a search keyword, and understand relationships between users in the market.

The project looks at payments between users on Venmo. A payment establishes a relationship between two users, and the message in the payment indicates the purpose of the payment. The project involves implementing a data pipeline that ingests a stream of Venmo payments, processes them in real-time, and stores them in a queryable format that makes the webapp functionality possible.


## Data Pipeline
The pipeline starts with a stream of Venmo payments as JSON records, which is written to Kafka for reliable ingestion.

From Kafka the data is written to S3 as a durable source of truth. Spark Streaming also reads from Kafka, parses the JSON, performs some real-time aggregations, and writes data to Elasticsearch and Cassandra.

Elasticsearch creates an inverted index on the payment messages, and makes it possible to search for payments based on their text content. Cassandra is used to store an adjacency list representation of user payment relationships, sorted by the payment time, which allows retrieving user connections graph within an arbitrary time window.

The webapp is built using Python Flask as the backend. Flask implements an API that queries Elasticsearch and  Cassandra. ReactJs is used to implement the frontend, which is a single page application that uses the Flask API.

![alt tag](https://raw.githubusercontent.com/altaha/mo-leads/master/webapp/app/frontend/public/static/images/data_pipeline.png)


## Code organization
The code is organized in the following directories:
- **infrastrcuture:** Contains config files and scripts to deploy the pipeline components on AWS. Deployment is based on the excellent [Pegasus tool](https://github.com/InsightDataScience/pegasus)
- **ingestion:** Contains a python script that reads Venmo JSON files from disk or S3, and writes them to a Kafka topic line by line, simulating a streaming input
- **spark_streaming:** Implements the Spark Streaming processing Job
- **webapp:** Contains code for the web application (backend and frontent)
- **webapp/app/frontend:** Contains the code for the ReactJS frontend
- **examples:** Various code examples used during development and testing
