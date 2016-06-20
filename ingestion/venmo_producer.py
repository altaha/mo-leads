import boto3
import botocore
import json
from kafka import KafkaProducer
import sys


class S3BucketReader(object):
    def __init__(self, bucket_name):
        self.error = True
        self.num_read = 0
        s3 = boto3.resource('s3')
        try:
            s3.meta.client.head_bucket(Bucket=bucket_name)
        except botocore.exceptions.ClientError as e:
            # If a client error is thrown, check that it was a 404 error.
            # If it was a 404 error, then the bucket does not exist.
            print (e.response['Error'])
            self.s3_bucket = None
        else:
            self.s3_bucket = s3.Bucket(bucket_name)
            self.error = False

    def lines(self, n):
        if self.error:
            return
        lines_read = 0
        for obj in self.s3_bucket.objects.all():
            object_response = obj.get()
            object_length = object_response['ContentLength']
            print 'Object Length: {}'.format(object_length)
            object_body = object_response['Body']
            buf = []
            for _ in xrange(object_length):
                if lines_read == n:
                    return
                char = object_body.read(1)
                if char == '\n':
                    yield ''.join(buf)
                    buf = []
                    lines_read += 1
                else:
                    buf.append(char)


class KafkaWriter(object):
    def __init__(self, kafka_server):
        self.producer = KafkaProducer(
            bootstrap_servers=kafka_server,
            value_serializer=lambda v: v.encode('UTF-8'),
        )

    def write(self, kafka_topic, value):
        self.producer.send(
            kafka_topic,
            value=value,
        )

    def write_file(self, kafka_topic, file_name):
        with open(file_name, 'r') as reader:
            for line in reader:
                self.write(kafka_topic, line)
        self.producer.flush()


VENMO_BUCKET='venmo-json'
KAFKA_SERVER='localhost'
KAFKA_TOPIC='venmo-data'
NUM_RECORDS=10000
FILES_LIST_FILE = 'files_list.txt'


if __name__ == "__main__":
    args = sys.argv
    kafka_writer = KafkaWriter(KAFKA_SERVER)
    source = str(args[1])
    if source == 's3':
        reader = S3BucketReader(VENMO_BUCKET)
        for line in reader.lines(NUM_RECORDS):
            kafka_writer.write(KAFKA_TOPIC, line)
    elif source == 'dump':
        num_producers = 1
        producer_id = 0
        if len(args) > 3:
            num_producers = int(str(args[2]))
            producer_id = int(str(args[3])) - 1
            print 'producer {} out of {} producers'.format(
                producer_id,
                num_producers,
            )

        files_list = []
        with open(FILES_LIST_FILE, 'r') as files_list_file:
            for file_name in files_list_file:
                files_list.append(file_name[:-1])

        print '{} files'.format(len(files_list))
        for i in xrange(producer_id, len(files_list), num_producers):
            print 'sending file {} to Kafka'.format(i)
            file_name = files_list[i]
            kafka_writer.write_file(KAFKA_TOPIC, file_name)
    else:
        file_name = str(args[2])
        kafka_writer.write_file(KAFKA_TOPIC, file_name)
    kafka_writer.producer.flush()
