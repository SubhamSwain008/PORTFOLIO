require("dotenv").config({ path: "./.env" });
var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.brevo_api_key;

var apiInstance = new SibApiV3Sdk.ContactsApi();
apiInstance.getLists().then(function(data) {
  console.log('API called successfully. Returned data: ' + JSON.stringify(data));
}, function(error) {
  console.error(error);
});
