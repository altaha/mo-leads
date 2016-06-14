from flask import jsonify, render_template

from app import app
from cassandra.cluster import Cluster
from elasticsearch import Elasticsearch

# setting up connections to cassandra
es = Elasticsearch(['ec2-52-41-104-228.us-west-2.compute.amazonaws.com'])
cluster = Cluster(['localhost'])
session = cluster.connect('moleads')


@app.route('/')
@app.route('/index')
def index():
    user = {'nickname': 'Kafka'}
    return render_template("index.html", title='Home', user=user)


@app.route('/api/message/')
def get_messages():
    statement = 'SELECT * FROM messages limit 100;'
    response = session.execute(statement)
    json_response = [{'id': x.id, 'message': x.message} for x in response]
    return jsonify(messages=json_response)


@app.route('/api/message/<id>')
def get_message(id):
    statement = 'SELECT * FROM messages WHERE id={}'.format(id)
    response = session.execute(statement)
    json_response = [{'id': x.id, 'message': x.message} for x in response]
    return jsonify(messages=json_response)


@app.route('/api/payments/<keywords>')
def get_elastic_search_messages(keywords):
    result = es.search(
        index='spark',
        body={'query': {'match': {'message': keywords}}},
    )
    return jsonify(payments=result['hits']['hits'])
