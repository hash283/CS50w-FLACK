# CS50w PROJECT2:FLACK
This is a repository for Project 2:FLACK of the CS50 Web Development Course at [edx](https://www.edx.org/course/cs50s-web-programming-with-python-and-javascript).

For this project,I have built FLACK,an online messaging service using Flask and Javascript,similar in spirit to Slack.Users are able to sign into the website with a display name, create channels (i.e. chatrooms) to communicate in, as well as see and join existing channels. Once a channel is selected, users will be able to send and receive messages with one another in real time.

Features:
- Users can create individual channels to communicate in as well as see and join existing channels.
- Once a channel is selected, users will be able to send and receive messages with one another in real time.
- Text messages are color-coded(messages seny by others are grey,while messages sent by you are highlighted in blue).
- Users can delete their own messages.

List of files:
- application.py:The file containing the code for the server-side code
- object.py:The file which defines a class called "message" for use in server-side code.
- main.css:The CSS stylesheet for styling the website.
- channel.js:The file containg client-side code(javascript)
- layout.html:The file containing the parent template to be inherited using JINJA2 template system
- signup.html:The file containing the HTML for signup for new users 
- home.html:The file containing the HTML for the home page of the website.
- channel.html:The file containing the HTML for the individual channels

![](https://i.imgur.com/uumMJtf.png)
![](https://i.imgur.com/3LymrCM.png)
![](https://i.imgur.com/hDRfe5z.png)
![](https://i.imgur.com/4R0fVf3.png)
![](https://i.imgur.com/PQucvNp.png)
![](https://i.imgur.com/l82yLfH.png)

Issues:
- This project does not make use of any database.
- For any channel,the maximum no of messages supported is 100.

## Setup
```bash
# Clone repo
$ git clone https://github.com/hash283/CS50w-FLACK.git

# Change directory
$ cd CS50w-FLACK/

# Install dependencies
$ pip install -r requirements.txt

#Run application
$ python application.py
```
