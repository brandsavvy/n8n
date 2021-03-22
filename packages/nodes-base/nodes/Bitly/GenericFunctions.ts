import {
	OptionsWithUri,
 } from 'request';

import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	IDataObject,
 } from 'n8n-workflow';

export async function bitlyApiRequest(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions, method: string, resource: string, body: any = {}, qs: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const authenticationMethod = this.getNodeParameter('authentication', 0) as string;
	let options: OptionsWithUri = {
		headers: {},
		method,
		qs,
		body,
		uri: uri ||`https://api-ssl.bitly.com/v4${resource}`,
		json: true,
	};
	options = Object.assign({}, options, option);
	if (Object.keys(options.body).length === 0) {
		delete options.body;
	}

	try{
		if (authenticationMethod === 'accessToken') {
			const credentials = this.getCredentials('bitlyApi');
			if (credentials === undefined) {
				throw new Error('No credentials got returned!');
			}
			options.headers = { Authorization: `Bearer ${credentials.accessToken}`};

			return await this.helpers.request!(options);
		} else {

			return await this.helpers.requestOAuth2!.call(this, 'bitlyOAuth2Api', options, { tokenType: 'Bearer' });
		}
	} catch(error) {

		if (error.response && error.response.body && error.response.body.message) {
			// Try to return the error prettier
			const errorBody = error.response.body;
			throw new Error(`Bitly error response [${error.statusCode}]: ${errorBody.message}`);
		}

		// Expected error data did not get returned so throw the actual error
		throw error;
	}
}

/**
 * Make an API request to paginated flow endpoint
 * and return all results
 */
export async function bitlyApiRequestAllItems(this: IHookFunctions | IExecuteFunctions| ILoadOptionsFunctions, propertyName: string, method: string, resource: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;
	let uri: string | undefined;
	query.size = 50;

	do {
		responseData = await bitlyApiRequest.call(this, method, resource, body, query, uri);
		returnData.push.apply(returnData, responseData[propertyName]);
		if (responseData.pagination && responseData.pagination.next) {
			uri = responseData.pagination.next;
		}
	} while (
		responseData.pagination !== undefined &&
		responseData.pagination.next !== undefined
	);
	return returnData;
}