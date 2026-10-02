(async () => {
  const response = await fetch(
    "https://app.mobitechtechnologies.com//sms/sendsms",
    {
      method: "POST",
      headers: {
        h_api_key: "xxx",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile: "+254768731991",
        response_type: "json",
        sender_name: "FULL_CIRCLE",
        service_id: 0,
        message: "This is a message.\n\nRegards\nMobitech Technologies Ltd",
      }),
    },
  );

  const data = await response.json();

  console.log(data);
})();
