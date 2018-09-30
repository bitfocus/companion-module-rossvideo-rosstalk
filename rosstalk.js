var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN);

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 7788);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {});
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'To make sense of the input and output names available in the actions provided by this module, you might want to read the bottom of <a href="http://help.rossvideo.com/carbonite-device/Topics/Protocol/RossTalk/CNT/RT-CNT-Comm.html" target="_new">this reference manual</a>.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Switcher Frame IP',
			width: 6,
			regex: self.REGEX_IP
		},
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};


instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {

		'gpi': {
			label:'Trigger GPI',
			options: [
				{
					 type: 'textinput',
					 label: 'Number',
					 id: 'gpi',
					 default: '1',
					 regex: self.REGEX_NUMBER
				}
			]
		},

		'cc': {
			label:'Fire custom control',
			options: [
				{
					 type: 'textinput',
					 label: 'CC Bank',
					 id: 'bank',
					 default: '1',
					 regex: self.REGEX_NUMBER
				},
				{
					 type: 'textinput',
					 label: 'CC Number',
					 id: 'cc',
					 default: '1',
					 regex: self.REGEX_NUMBER
				}
			]
		},

		'loadset': {
			label:'Load Set',
			options: [
				{
					type: 'textinput',
					label: 'Set name',
					id: 'set',
					default: 'set1',
				}
			]
		},

		'cut': {
			label:'Cut',
			options: [
				{
					type: 'textinput',
					label: 'MLE',
					id: 'mle',
					default: 'ME:1',
				}
			]
		},

		'autotrans': {
			label:'Auto Transition',
			options: [
				{
					type: 'textinput',
					label: 'MLE',
					id: 'mle',
					default: 'ME:1',
				}
			]
		},

		'xpt': {
			label:'XPT',
			options: [
				{
					type: 'textinput',
					label: 'Destination',
					id: 'vidDest',
					default: 'ME:1:PGM',
					tooltip: 'Program - ME:(ME-number):PGM, AuxBus — AUX:(aux-number), Key — ME:(ME-number):KEY:(key-number), MiniME™ — MME:(ME-number), Preset — ME:(ME-number):PST'
				},
				{
					type: 'textinput',
					label: 'Source',
					id: 'vidSource',
					default: 'IN:20',
					tooltip: 'Aux Bus — AUX:(aux-number), Black — BK, Clean — ME:(ME-number):CLN, Input Source — IN:(input-number), Key — ME:(ME-number):KEY:(key-number), Matte Color — BG, Media-Store — MS:(channel-number), MiniME™ — MME:(ME-number), Preview — ME:(ME-number):PV, Program — ME:(ME-number):PGM, XPression Alpha — XP:(channel-number):A [Graphite only], XPression Video — XP:(channel-number):V [Graphite only], Chroma Key Video — CK:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only], Chroma Key Alpha — CKA:(chroma key number) [UltraChromeHR, or Carbonite Black v14.0 or higher only]'
				}
			]
		},

		'transKey': {
			label:'Transition Keyer',
			options: [
				{
					type: 'textinput',
					label: 'MLE',
					id: 'mle',
					default: 1,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Keyer',
					id: 'key',
					default: 1,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'dropdown',
					label: 'Transition On/Off Air',
					id: 'transD',
					choices: [
						{ id: 'ON',  label: 'Transition OnAir'},
						{ id: 'OFF', label: 'Transition OffAir'}
					]
				},
				{
					type: 'dropdown',
					label: 'Transition type',
					id: 'transT',
					choices: [
						{ id: 'AUTO',  label: 'Auto Transition'},
						{ id: 'CUT',   label: 'Cut Transition '}
					]
				}
			]
		},

		'ftb':		{ label: 	'Fade to black' }

	});
}

instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;
	var opt = action.options;

	// parseInt(action.options.int)
	var cmd;

	switch (action.action) {

		case 'gpi':
			var gpi = parseInt(opt.gpi);
			cmd = 'GPI ' + (gpi > 9 ? '' : '0') + gpi;
			break;

		case 'cc':
			var cc = parseInt(opt.cc);
			cmd = 'CC ' + parseInt(opt.bank) + ':' + (cc > 9 ? '' : '0') + cc;
			break;

		case 'xpt':
			var src = opt.vidSource;
			var dst = opt.vidDest;
			cmd = 'XPT ' + dst + ':' + src;
			console.log('ross xpt:', cmd);
			break;

		case 'ftb':
			cmd = 'FTB';
			break;

		case 'loadset':
			cmd = 'LOADSET ' + opt.set;
			break;

		case 'cut':
			cmd = 'MECUT ' + opt.mle;
			break;

		case 'autotrans':
			cmd = 'MEAUTO ' + opt.mle;
			break;

		case 'transKey':
			cmd = 'KEY'+ opt.transT + opt.transD + ' ME:' + opt.mle + ':' + opt.key;
			break;

	}

	if (cmd !== undefined) {

		debug('sending tcp',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\n");
		} else {
			debug('Socket not connected :(');
		}

	}

	debug('action():', action);


};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
