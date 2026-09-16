const response = await fetch(
  "https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?address1=3614%20Russell%20Ave%20N&address2=Minneapolis%2C%20MN%2055412",
  {
    method: "GET",
    headers: {
      apikey: process.env.ATTOM_API_KEY,
      Accept: "application/json",
    },
  }
);

console.log("HTTP:", response.status);
console.log(await response.text());