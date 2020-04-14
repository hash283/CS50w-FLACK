import os,requests
import json
from flask import Flask,session,render_template,request,redirect,url_for,jsonify,flash
from flask_session import Session
from flask_socketio import SocketIO,emit
from object import *

app = Flask(__name__)

socketio = SocketIO(app)

users=[]
channels={}
channel_names=[]

@app.route("/",methods=["POST","GET"])
def signup():
	if request.method == "GET":
		return render_template("signup.html",channel_names=json.dumps(channel_names))
	else:
		username=request.form.get("username")
		if username not in users:
			users.append(username)
			return jsonify({"Found":False})
		else:
			return jsonify({"Found":True})

@app.route("/home")
def home():
	return render_template("home.html",channels=channels)

@app.route("/channel/<string:channel_name>")
def channel(channel_name):
	return render_template("channel.html",channels=channels,channel_name=channel_name,index=0)

@socketio.on("submit message")
def vote(data):
	text=data["text"]
	username=data["username"]
	timestamp=data["timestamp"]
	current_channel_name=data["channel"]
	# creating an object msg of message class
	msg=message(text=text,username=username,timestamp=timestamp)
	channels[current_channel_name]["Messages"].append(msg)
	emit("display message",{"text": text,"username":username,"timestamp":timestamp},broadcast=True)

@socketio.on("create channel")
def create_channel(data):
	channel_name=data["channel_name"]
	channel_names.append(channel_name)
	channels[channel_name]={"Messages":[],"Users":[]}
	emit("display channel",{"channel_name":channel_name},broadcast=True)

@socketio.on("join channel")
def join_channel(data):
	channel_name=data["channel_name"]
	username=data["user"]
	channels[channel_name]["Users"].append(username)
	emit("channel joined",broadcast=True)

@socketio.on("length exceeded")
def length_exceeded(data):
	channel_name=data["channel"]
	channels[channel_name]["Messages"].pop(0)
	emit("popped first message",broadcast=True)

@socketio.on("delete message")
def delete_message(data):
	channel_name=data["channel_name"]
	username=data["username"]
	text=data["text"]
	timestamp=data["timestamp"]
	index_val=data["index"]
	del_msg=message(text=text,username=username,timestamp=timestamp)
	msg_len=len(channels[channel_name]["Messages"])
	for index in range(0,msg_len):
		if del_msg==channels[channel_name]["Messages"][index]:
			channels[channel_name]["Messages"].pop(index)
			break
	emit("message deleted",{"index":index_val},broadcast=True)

if __name__ == '__main__':
	socketio.run(app,debug=True)