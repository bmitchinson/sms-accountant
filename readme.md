### SMS Accountant

Goal:
Anytime I spend money the transaction is stored in a database, and I get an immediate notification to categorize it.
When I exceed or approach category budget limits, I am made aware.

### todos

- [x] google auth - view your emails from my api as an auth test
- [x] add tsc checking
- [x] docker package + deployed to my home server (https://budget.mitchinson.dev)
- [x] parse chase emails
- [x] send a telegram message reflecting recent chase transaction
- [ ] add parse result to sqlite entry
- [x] backup sqlite entry every day
- [x] mark email as "processed"
- [ ] sentry logs
- [ ] prompt user over telegram to categorize item
- [x] add docker build to cicd
... more in goal.md

### Tech
- gmail
- ~~twilio~~ (They require a business entity now? sms regulation is whack now. Vonage would be ~$4 a month.) telegram it is
- docker / unraid / cloudflare (in front of hosting at home)
- bun ts runtime
- lazygit

From [bmitchinson/typescript-template](https://github.com/bmitchinson/typescript-template)