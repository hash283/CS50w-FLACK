class message:
	def __init__(self,text,username,timestamp):
		self.text=text
		self.username=username
		self.timestamp=timestamp
	def __eq__(self, other):
		return self.__dict__ == other.__dict__