from flask import (
    jsonify,
    render_template,
    request,
)

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



@app.route('/api/adjacency/')
def get_adjacency():
    root_users = request.args.get('root').split(',')
    t1 = request.args.get('t1')
    start_time_filter = 'AND time >= \'{}\''.format(t1) if t1 else ''
    t2 = request.args.get('t2')
    end_time_filter = 'AND time <= \'{}\''.format(t2) if t2 else ''

    statement = 'SELECT * FROM adjacency WHERE actor_id IN ({0}) {1} {2} limit 100;'.format(
        ','.join('\'{}\''.format(user) for user in root_users),
        start_time_filter,
        end_time_filter,
    )
    response = session.execute(statement)
    return jsonify([x for x in response])


@app.route('/api/word_count/latest/')
def get_word_count():
    statement = 'select word_count from word_counts where period = \'seconds\' ORDER BY time DESC limit 5;'
    response = session.execute(statement)
    result = dict()
    for row in response:
        row_dict = dict(row.word_count)
        result.update(row_dict)
    return jsonify(result)


@app.route('/api/payments/<keywords>/')
def get_elastic_search_messages(keywords):
    result = es.search(
        index='moleads',
        doc_type='payment',
        body={
            'from': 0, 'size': 100,
            'query': {'match': {'message': keywords}}
        },
    )
    return jsonify(payments=result['hits']['hits'])
