# -*- coding: utf-8 -*-
#!/usr/bin/env python
import pika
import sys
import signal

class RpcConsumer():
    def __init__(self):
        signal.signal(signal.SIGINT, self.close)
        self.name = ' '.join(sys.argv[1:]) or "Unnamed"
        print(" [*] Running Worker %r" % self.name)
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
        self.channel = self.connection.channel()

        self.channel.queue_declare(queue='rpc_queue', durable=True)

    def toUpper(self, msg):
        return self.name + " - " +msg.upper()

    def publishResp(self, props, msg):
        self.channel.basic_publish(exchange='',
                              routing_key=props.reply_to,
                              properties=pika.BasicProperties(correlation_id = \
                                                             props.correlation_id),
                              body=msg)
    
    def callback(self, ch, method, properties, body):
        print(" [x] Received %r" % body)
        message = self.toUpper(body)
        self.publishResp(properties, message)
        
        print(" [x] Sent %r" % message)
        ch.basic_ack(delivery_tag = method.delivery_tag)
        print(" [x] Done")
    
    def consume(self):
        print(' [*] Waiting for messages. To exit press CTRL+C')
        
        self.channel.basic_qos(prefetch_count=1)
        self.channel.basic_consume(self.callback,
                      queue='rpc_queue')

        self.channel.start_consuming()
    def close(self, signal, frame):
        print('Closed connection.\n Terminated.')
        self.connection.close()
        sys.exit(0)

if __name__ == '__main__':
    rpc = RpcConsumer()
    rpc.consume()
    signal.pause()