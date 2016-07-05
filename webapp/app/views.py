from flask import (
    jsonify,
    render_template,
    request,
)

from app import app
from cassandra.cluster import Cluster
from elasticsearch import Elasticsearch

# setting up connections to elasticsearch
try:
    es = Elasticsearch(['ec2-52-42-25-17.us-west-2.compute.amazonaws.com'])
except:
    es = None

# setting up connections to cassandra
try:
    cluster = Cluster(['ec2-52-42-38-11.us-west-2.compute.amazonaws.com'])
    session = cluster.connect('moleads')
except:
    session = None


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


@app.route('/api/adjacency/<user_id>/')
def get_adjacency_for_user(user_id):
    t1 = request.args.get('t1')
    start_time_filter = 'AND time >= \'{}\''.format(t1) if t1 else ''
    t2 = request.args.get('t2')
    end_time_filter = 'AND time <= \'{}\''.format(t2) if t2 else ''

    statement = 'SELECT * FROM adjacency WHERE actor_id = \'{0}\' {1} {2} limit 100;'.format(
        user_id,
        start_time_filter,
        end_time_filter,
    )
    response = session.execute(statement)
    first_degree = [x for x in response]

    first_degree_connections = (
        '\'{}\''.format(user.target_id) for user in first_degree if user.target_id != user_id
    )
    statement = 'SELECT * FROM adjacency WHERE actor_id IN ({0}) {1} {2} limit 100;'.format(
        ','.join(first_degree_connections),
        start_time_filter,
        end_time_filter,
    )
    response = session.execute(statement)
    second_degree = [x for x in response]
    return jsonify(first_degree + second_degree)


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
    get_significant_terms = 'significant' in request.args

    query_body = {
        'from': 0, 'size': 100,
        'query': {'match_phrase': {'message': keywords}}
    }
    significant_terms_query = {
        'aggs': {
            'most_sig': {
                'significant_terms': {
                    'field': 'message',
                    'size': 10
                }
            }
        }
    }
    if get_significant_terms:
        query_body.update(significant_terms_query)

    result = es.search(
        index='moleads',
        doc_type='payment',
        body=query_body,
    )
    output = {
        'payments': result['hits']['hits']
    }
    if get_significant_terms:
        output['significant'] = result['aggregations']['most_sig']['buckets']
    return jsonify(output)
