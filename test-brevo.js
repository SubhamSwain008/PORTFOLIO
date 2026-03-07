require("dotenv").config({ path: "./.env" });
var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;

var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.brevo_api_key;

var apiInstance = new SibApiV3Sdk.EmailCampaignsApi();
var emailCampaigns = new SibApiV3Sdk.CreateEmailCampaign();

emailCampaigns.name = "Campaign sent via the API";
emailCampaigns.subject = "My subject";
emailCampaigns.sender = {"name": "From name", "email": "weaponx1oov2.o@gmail.com"};
emailCampaigns.type = "classic";
emailCampaigns.htmlContent = 'Congratulations! You successfully sent this example campaign via the Brevo API.';
emailCampaigns.recipients = {listIds: [1]};

console.log("Sending...");
apiInstance.createEmailCampaign(emailCampaigns).then(function(data) {
  console.log('API called successfully. Returned data: ' + JSON.stringify(data));
}, function(error) {
  console.error("SDK Error:");
  if (error.response && error.response.text) {
    console.error(error.response.text);
  } else {
    console.error(error);
  }
});
