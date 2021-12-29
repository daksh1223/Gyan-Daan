const msal = require("@azure/msal-node");
const axios = require("axios");
const {
  create_new_user,
  find_user_by_email,
} = require("../Repository/user_repository");

//Configuration required to create a msal application object
const config = {
  auth: {
    clientId: "ca48ebb7-1079-4d7b-83c1-f7e02180e53b",
    authority: "https://login.microsoftonline.com/common",
    clientSecret: "-z3ICQM.Fg_a661~ta4ci_N6518x.03wC3",
    postlogoutRedirectUri: "http://localhost:3000/logout/",
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {},
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.error,
    },
  },
};
//get user data with the access token acquired.
const get_user_data = async (accessToken) => {
  // Get the data using Microsoft graph API and pass the access token in the headers.
  const data = await axios.get("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const response = await find_user_by_email(data.data.userPrincipalName); //Check whether the user exists in your database.
  // If so return the user's data.
  if (response) {
    return response;
  }
  // Else create a new entry in the database.
  const new_user = create_new_user();
  new_user.name = data.data.displayName;
  new_user.email = data.data.userPrincipalName;
  new_user.save();
  return new_user;
};

// Create msal application object
const MSAL_application = new msal.ConfidentialClientApplication(config);
//Authenticate function will return the Auth Code Url which will be generated using the msal application object created above.
const authenticate = async () => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: "http://localhost:3000/redirect",
  };
  // get url to sign user in and consent to scopes needed for application
  let req_response = {};
  const MSAL_application_data = await MSAL_application.getAuthCodeUrl(
    authCodeUrlParameters
  );

  req_response.response = MSAL_application_data;
  return req_response;
};

// The function will be used to acquire the token using the code present as the query string in the redirect url.
const redirect_request = async (redirect_url, code) => {
  const tokenRequest = {
    code: code,
    scopes: ["user.read"],
    redirectUri: "http://localhost:3000/redirect", // This redirecturi is the same one which was registered in the azure portal.
  };
  let redirect_response = {};
  const response = await MSAL_application.acquireTokenByCode(tokenRequest); // We will get a token using the code.
  const user_data = async () => {
    const data = await get_user_data(response.accessToken);
    redirect_response.user = data;
    if (redirect_url) {
      // If redirect url exists then it will be used to redirect back to the requested page.
      redirect_response.redirect_url = redirect_url;
    } else redirect_response.redirect_url = "/home"; // If not then it will redirect it to the home page.
  };
  const data = await user_data();
  return redirect_response;
};

exports.authenticate = authenticate;
exports.redirect_request = redirect_request;
