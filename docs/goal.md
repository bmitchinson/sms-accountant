<!-- this document mainly exists for LLM Context -->

# Goal

Anytime I spend my app asks me over sms for a categorization + description.
Results then stored using google sheets as a backend.

# Flow

- I spend money
- Chase notifies my server using a dedicated sms number (or email?)
- My app saves the purchase info to google sheets, un-categorized
- My app then sends me this sms text

```
code: (green guess) / $23.44 (Chase)
Please reply with "green guess - {description} - category_id"
```

- the two words "green guess" act as a transaction id. Each word is 5 letters always.
- I send a response with the following

```
green guess - new cd - 1
```

- My app updates the transaction row in the google sheets database with the following
  - description: "new cd"
  - category: "Software / Media" (due to a preconfigured category list pairing "1" with that category)

# Deployment

- The app will be deployed on my home network on an unraid server running
docker containers
todo:
- docker image w secrets properly mounted
- unraid docker compose commands linked
- sentry log forwarding

# Edge cases

- Each budget should be in a monthly sheet in this sheets document
- If a first transaction for a month is being created, a "template" sheet that I have
configured should be used as the source to create a sheet copy

# Future Features

- Sending my server “category” sends me all current configured categories
  - Categories are defined on a sheets page

- Venmo has webhooks as an incoming message. (Email on any spend would be preferred to align w chase)

- Allow me to adjust the cost of a past purchase by a multiplier, to account for purchases I know I'm splitting
and will eventually receive a credit for.

- Allow me to split a purchase into multiple entries with different portions assigned a different category
  - Example: "apple trust - new cd - .4x1,.6x2" (for a 10 dollar purchase)
  - This would create "apple trust - new cd - 1" ($4) and "apple trust - new cd - 2" ($6)

- Budget status
  - "budget" should report with a budget list by category of targeting spending limits
  - These targets should be defined inline the monthly budget sheet, and sourced from a template.
  - After reaching "75%" of a budget and "100%" of a budget, I should receive a text

- Allow me to create a new spending entry myself, in case it was spent on somewhere other than chase
 - Example: "manual - 23.10 - drinks with Maeve - 3"
 - "Created 'young flats - $23.10 - drinks with Maeve - 3"

- make "setupGoogleAuth.ts" an actual part of the app, available on a route

# Design Questions

- Question: What is the best email api for such low usage like this, read only, never sending emails.
  - I'd like a dedicated inbox. Instead of reusing my gmail.
  - Chase also offers it's notifications to come in over email.
  - That would probably be best to have an easier to access message log.

# Notes that should be ignored by LLMs reading this file

- https://www.budgetsheet.com/
    - This is interesting but, building what I have listed above lets me build towards 
    getting a message like “gaming budget is at $10/$100”, for realtime budget alerts