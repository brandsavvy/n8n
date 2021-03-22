import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';

/**
 * Make an API request to SIGNL4
 *
 * @param {IHookFunctions | IExecuteFunctions} this
 * @param {string} method
 * @param {string} contentType
 * @param {string} body
 * @param {object} query
 * @param {string} teamSecret
 * @param {object} options
 * @returns {Promise<any>}
 *
 */

export async function SIGNL4ApiRequest(this: IExecuteFunctions, method: string, body: string, query: IDataObject = {}, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const credentials = this.getCredentials('signl4Api');

	const teamSecret = credentials?.teamSecret as string;

	let options: OptionsWithUri = {
		headers: {
			'Accept': '*/*',
		},
		method,
		body,
		qs: query,
		uri: `https://connect.signl4.com/webhook/${teamSecret}`,
		json: true,
	};

	if (!Object.keys(body).length) {
		delete options.body;
	}
	if (!Object.keys(query).length) {
		delete options.qs;
	}
	options = Object.assign({}, options, option);

	try {
		return await this.helpers.request!(options);
	} catch (error) {

		if (error.response && error.response.body && error.response.body.details) {
			throw new Error(`SIGNL4 error response [${error.statusCode}]: ${error.response.body.details}`);
		}

		throw error;
	}
}