import sys
import ssl
import paho.mqtt.client as mqtt
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout,
    QPushButton, QTextEdit, QLineEdit, QLabel
)
from PyQt6.QtCore import pyqtSignal, QObject


BROKER = "localhost"
PORT = 8883
TOPIC = "test"


class MQTTClient(QObject):
    message_signal = pyqtSignal(str)

    def __init__(self):
        super().__init__()

        self.client = mqtt.Client()

        # TLS configuration
        self.client.tls_set(
            ca_certs="ca.crt",
            certfile="client.crt",
            keyfile="client.key",
            tls_version=ssl.PROTOCOL_TLSv1_2
        )

        self.client.tls_insecure_set(False)

        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def connect(self):
        self.client.connect(BROKER, PORT, 60)
        self.client.loop_start()

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.message_signal.emit(" Connected securely")
            client.subscribe(TOPIC)
        else:
            self.message_signal.emit(f" Connection failed: {rc}")

    def on_message(self, client, userdata, msg):
        message = msg.payload.decode()
        self.message_signal.emit(f" {message}")

    def publish(self, message):
        self.client.publish(TOPIC, message)


class MQTTWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Secure MQTT Client (TLS)")
        self.setGeometry(200, 200, 400, 400)

        layout = QVBoxLayout()

        self.status_label = QLabel("Status: Disconnected")
        layout.addWidget(self.status_label)

        self.message_box = QTextEdit()
        self.message_box.setReadOnly(True)
        layout.addWidget(self.message_box)

        self.input_field = QLineEdit()
        layout.addWidget(self.input_field)

        self.send_button = QPushButton("Send")
        layout.addWidget(self.send_button)

        self.setLayout(layout)

        # MQTT
        self.mqtt_client = MQTTClient()
        self.mqtt_client.message_signal.connect(self.update_messages)

        self.send_button.clicked.connect(self.send_message)

        self.mqtt_client.connect()

    def update_messages(self, message):
        self.message_box.append(message)
        if "Connected securely" in message:
            self.status_label.setText("Status: Connected (TLS)")

    def send_message(self):
        text = self.input_field.text()
        if text:
            self.mqtt_client.publish(text)
            self.input_field.clear()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MQTTWindow()
    window.show()
    sys.exit(app.exec())