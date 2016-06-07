import boto3
import botocore
import json
from kafka import KafkaProducer


def get_s3_bucket(bucket_name):
    s3 = boto3.resource('s3')
    try:
        s3.meta.client.head_bucket(Bucket=bucket_name)
    except botocore.exceptions.ClientError as e:
        # If a client error is thrown, check that it was a 404 error.
        # If it was a 404 error, then the bucket does not exist.
        print (e.response['Error'])
        return None
    else:
        return s3.Bucket(bucket_name)


def get_s3_object(bucket):
    for obj in bucket.objects.limit(1):
        first_obj = obj
    return first_obj.get()['Body']


def get_object_line(object_body):
    test = []
    char = None
    while char != '\n':
        char = object_body.read(1)
        test.append(char)
    return ''.join(test)


VENMO_BUCKET='venmo-json'
KAFKA_TOPIC='venmo-data'
NUM_RECORDS=100

s3_bucket = get_s3_bucket(VENMO_BUCKET)
s3_object = get_s3_object(s3_bucket)
producer = KafkaProducer(
    bootstrap_servers='localhost',
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
)

for _ in xrange(NUM_RECORDS):
    transaction_json = get_object_line(s3_object)
    transaction = json.loads(transaction_json)
    producer.send(
        KAFKA_TOPIC,
        value=transaction,
        key=transaction['actor']['id'].encode('UTF-8'),
    )
producer.flush()
