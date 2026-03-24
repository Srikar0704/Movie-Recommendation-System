import json
from decimal import Decimal
from datetime import datetime
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def test():
    data = {"rating": Decimal("8.5"), "created_at": datetime.now()}
    return jsonify(data)

if __name__ == "__main__":
    with app.test_request_context():
        try:
            print(test().get_data(as_text=True))
        except Exception as e:
            print("ERROR:", e)
