module.exports = {
	legacy_upgrade(context, props) {
		/* props
		{
			config: Object | null,
			actions: [],
			feedbacks: [],
		}
		*/
		let result = {
			updatedConfig: null, // the config does not need updating
			updatedActions: [],
			updatedFeedbacks: [],
		}
		let actions = props.actions

		for (let actionsItem of actions) {
			if (actionsItem['action'] == 'transKey') {
				if (actionsItem['options']['mle'] != undefined) {
					actionsItem['options']['mle'] = 'ME:' + actionsItem['options']['mle']
					result.updatedActions.push(actionsItem)
				}
			}
		}

		return result
	},
}
