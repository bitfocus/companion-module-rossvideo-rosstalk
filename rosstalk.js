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

instance.GetUpgradeScripts = function() {
	return [
		function (context, config, actions, feedbacks) {
			let changed = false;
	
			for(let actionsItem of actions){
				if(actionsItem['action'] == 'transKey'){
					if(actionsItem['options']['mle'] != undefined){
						actionsItem['options']['mle'] = "ME:"+actionsItem['options']['mle'];
						changed = true;
					}
				}
			}
	
			return changed;
		}
	]
}

instance.prototype.updateConfig = function (config) {
	var self = this;

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function () {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN);

	self.init_tcp();
};

instance.prototype.init_tcp = function () {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		if (self.config.port === undefined) {
			self.config.port = 7788;
		}
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error', "Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		});

		self.socket.on('data', function (data) { });
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
			label: 'Switcher Frame/XPression IP',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Switcher Frame/XPression Port',
			width: 6,
			default: "7788",
			regex: self.REGEX_NUMBER
		}
	];
};

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};


instance.prototype.actions = function (system) {
	var self = this;
	self.setActions({

		'gpi': {
			label: 'Trigger GPI',
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

		'gpiByName': {
			label: 'Trigger GPI by Name',
			options: [
				{
					type: 'textinput',
					label: 'Name',
					id: 'gpi',
				},
				{
					type: 'textinput',
					label: 'Parameter',
					id: 'parameter',
				}
			]
		},

		'cc': {
			label: 'Fire custom control',
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
			label: 'Load Set',
			options: [
				{
					type: 'textinput',
					label: 'Set name',
					id: 'set',
					default: 'set1'
				}
			]
		},

		'cut': {
			label: 'Cut',
			options: [
				{
					type: 'textinput',
					label: 'MLE',
					id: 'mle',
					default: 'ME:1'
				}
			]
		},

		'autotrans': {
			label: 'Auto Transition',
			options: [
				{
					type: 'textinput',
					label: 'MLE',
					id: 'mle',
					default: 'ME:1'
				}
			]
		},

		'xpt': {
			label: 'XPT',
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
			label: 'Transition Keyer',
			options: [
				{
					type: 'textinput',
					label: 'MLE',
					id: 'mle',
					default: "ME:1"
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
					label: 'Transition On/Off Air (On & Off options may not be available in all switchers)',
					id: 'transD',
					default: 'TOGGLE',
					choices: [
						{ id: 'TOGGLE', label: 'Toggle Keyer' },
						{ id: 'ON', label: 'Transition OnAir' },
						{ id: 'OFF', label: 'Transition OffAir' }
					]
				},
				{
					type: 'dropdown',
					label: 'Transition type',
					id: 'transT',
					default: 'CUT',
					choices: [
						{ id: 'AUTO', label: 'Auto Transition' },
						{ id: 'CUT', label: 'Cut Transition ' }
					]
				}
			]
		},

		'ftb': { label: 'Fade to black' },

		'CLFB': {
			label: 'Clear Framebuffer',
			options: [
				{
					type: 'textinput',
					label: 'Framebuffer',
					id: 'fb',
					default: 1,
					regex: self.REGEX_NUMBER
				}
			]
		},

		'CLFB_layer': {
			label: 'Clear Layer',
			options: [
				{
					type: 'textinput',
					label: 'Framebuffer',
					id: 'fb',
					default: 1,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'layer (OPTIONAL)',
					id: 'layer',
					default: '',
					regex: self.REGEX_NUMBER
				}
			]
		},

		'CLRA': { label: 'Clear All Framebuffers' },

		'CUE': {
			label: 'CUE',
			options: [
				{
					type: 'textinput',
					label: 'Take ID',
					id: 'takeID',
					default: 0,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'frameBuffer',
					id: 'fb',
					default: 1,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'layer',
					id: 'layer',
					default: '',
					regex: self.REGEX_NUMBER
				}
			]
		},

		'DOWN': { label: 'DOWN' },

		'FOCUS': {
			label: 'FOCUS',
			options: [
				{
					type: 'textinput',
					label: 'Take ID',
					id: 'takeID',
					default: 0,
					regex: self.REGEX_NUMBER
				}
			]
		},

		'LAYEROFF': {
			label: 'LAYEROFF',
			options: [
				{
					type: 'textinput',
					label: 'frameBuffer',
					id: 'fb',
					default: 1,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Layer',
					id: 'layer',
					default: 0,
					regex: self.REGEX_NUMBER
				}
			]
		},

		'MEM': {
			label: 'MEM',
			options: [
				{
					type: 'textinput',
					label: 'Memory ID',
					id: 'memID',
					default: '1:1',
					regex: self.REGEX_STRING
				}
			]
		},


		'NEXT': { label: 'NEXT' },

		'READ': { label: 'READ' },

		'RESUME': {
			label: 'RESUME FRAMEBUFFER',
			options: [
				{
					type: 'textinput',
					label: 'Framebuffer',
					id: 'fb',
					default: 1,
					regex: self.REGEX_NUMBER
				}
			]
		},

		'RESUME_layer': {
			label: 'RESUME LAYER',
			options: [
				{
					type: 'textinput',
					label: 'Framebuffer',
					id: 'fb',
					default: 1,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Layer',
					id: 'layer',
					default: 0,
					regex: self.REGEX_NUMBER
				}
			]
		},

		'SEQI': {
			label: 'SEQI',
			options: [
				{
					type: 'textinput',
					label: 'take ID',
					id: 'takeID',
					default: 0,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Layer',
					id: 'Layer',
					default: 0,
					regex: self.REGEX_NUMBER
				}
			]
		},

		'SEQO': {
			label: 'SEQO',
			options: [
				{
					type: 'textinput',
					label: 'take ID',
					id: 'takeID',
					default: 0,
					regex: self.REGEX_NUMBER
				}
			]
		},

		'SWAP': {
			label: 'SWAP',
			options: [
				{
					type: 'textinput',
					label: 'Framebuffer',
					id: 'fb',
					default: 0,
					regex: self.REGEX_NUMBER
				}
			]
		},

		'TAKE': {
			label: 'TAKE',
			options: [
				{
					type: 'textinput',
					label: 'Take ID',
					id: 'takeID',
					default: 0,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Framebuffer',
					id: 'fb',
					default: 0,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Layer',
					id: 'layer',
					default: 0,
					regex: self.REGEX_NUMBER
				}
			]
		},

		'UP': { label: 'UP' },

		'UPNEXT': {
			label: 'UPNEXT',
			options: [
				{
					type: 'textinput',
					label: 'Take ID',
					id: 'takeID',
					default: 0,
					regex: self.REGEX_NUMBER
				}
			]
		}

	});
};

instance.prototype.action = function (action) {
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

		case 'gpiByName':
			if (opt.parameter === null) {
				cmd = 'GPI ' + opt.gpi;
			} else {
				cmd = 'GPI ' + opt.gpi + ':' + opt.parameter;
			}

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
			if (opt.transD === 'TOGGLE') {
				cmd = 'KEY' + opt.transT + ' ' + opt.mle + ':' + opt.key;
			} else {
				cmd = 'KEY' + opt.transT + opt.transD + ' ' + opt.mle + ':' + opt.key;
			}
			break;

		case 'CLFB':
			var frameBuffer = parseInt(opt.fb) - 1; // Framebuffer is 0 index so framebuffer 1 is actually 0 in rosstalk
			cmd = 'CLFB ' + frameBuffer;
			break;

		case 'CLFB_layer':
			var frameBuffer = parseInt(opt.fb) - 1; // Framebuffer is 0 index so framebuffer 1 is actually 0 in rosstalk
			var layer = opt.layer;
			cmd = 'CLFB ' + frameBuffer + ':' + opt.layer;
			break;

		case 'CLRA':
			cmd = 'CLRA';
			break;

		case 'DOWN':
			cmd = 'DOWN';
			break;

		case 'MEM':
			var memID = opt.memID;
			cmd = 'MEM ' + memID;
			break;

		case 'FOCUS':
			var takeID = opt.takeID;
			cmd = 'FOCUS ' + takeID;
			break;

		case 'LAYEROFF':
			var layer = opt.layer;
			cmd = 'LAYEROFF ' + layer;
			break;

		case 'NEXT':
			cmd = 'NEXT';
			break;

		case 'READ':
			cmd = 'READ';
			break;

		case 'RESUME':
			var frameBuffer = parseInt(opt.fb) - 1;
			cmd = 'RESUME ' + frameBuffer;
			break;

		case 'RESUME_layer':
			var frameBuffer = parseInt(opt.fb) - 1;
			var layer = opt.layer;
			cmd = 'RESUME ' + frameBuffer + ':' + layer;

			break;

		case 'SEQI':
			var takeID = opt.takeID;
			var layer = opt.layer;
			cmd = 'SEQI ' + takeID + ':' + layer;
			break;

		case 'SEQO':
			var takeID = opt.takeID;
			cmd = 'SEQO ' + takeID;
			break;

		case 'SWAP':
			var frameBuffer = parseInt(opt.fb) - 1;
			cmd = 'SWAP ' + frameBuffer;

		case 'TAKE':
			var takeID = opt.takeID;
			var frameBuffer = parseInt(opt.fb) - 1;
			var layer = opt.layer;
			cmd = 'TAKE ' + takeID + ':' + frameBuffer + ':' + layer;
			break;

		case 'UP':
			cmd = 'UP';
			break;

		case 'UPNEXT':
			var takeID = opt.takeID;
			cmd = 'UPNEXT ' + takeID;
			break;
	}

	if (cmd !== undefined) {

		debug('sending tcp', cmd, "to", self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\r\n");
		}
		else {
			debug('Socket not connected :(');
		}

	}

	debug('action():', action);


};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
