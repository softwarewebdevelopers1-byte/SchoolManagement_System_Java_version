(async () => {
  const response = await fetch(
    "https://app.mobitechtechnologies.com//sms/sendsms",
    {
      method: "POST",
      headers: {
        h_api_key:
          "04bfc4e84b3f66a878ed148f731959c397510d63e37029e9df790a901b787382",
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
