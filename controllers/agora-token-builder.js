const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const token_builder = (channelName) => {
  const Agora_app_ID = "634ea2a35e544064b5baed7a74139995"; //App ID registered at agora site.
  const Agora_app_certificate = "9ecb9fd5f8cc440caaca697c5bf214a5"; //App certificate corresponding to the above app ID.

  const uid = Math.floor(Math.random() * 1000) + 1; // A randomly generated uid which will we be used to uniquely identify a user.
  const screenuid = Math.floor(Math.random() * 1000) + 1; // uid generated for the user's screen.
  const role = RtcRole.PUBLISHER;

  const expiration_duration = 360000; // Set expiration duration(in seconds) of the token generated.
  const current_time = Math.floor(Date.now() / 1000);
  const expiration_time = current_time + expiration_duration; // Set epiration time(in seconds) of the token generated.

  const token = RtcTokenBuilder.buildTokenWithUid( //RtcTokenBuilder will build the token and can do that with uid as well as user account.
    Agora_app_ID,
    Agora_app_certificate,
    channelName,
    uid,
    role,
    expiration_time
  );

  const screentoken = RtcTokenBuilder.buildTokenWithUid(
    Agora_app_ID,
    Agora_app_certificate,
    channelName,
    screenuid,
    role,
    expiration_time
  );
  // token and screen token are the tokens generated for the corresponding data given.

  return {
    token,
    screentoken,
    Agora_app_ID,
    uid,
    screenuid,
  };
};

module.exports = token_builder;
