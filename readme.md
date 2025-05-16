### SMS Accountant

Goal:
Anytime I spend my app asks me over sms for a categorization + description.
Results then stored using google sheets as a backend.

### todos

- [x] google auth - view your emails from my api as an auth test
- [x] add tsc checking
- [x] docker package + deployed (https://budget.mitchinson.dev)
- [x] parse chase emails
- [x] send twilio texts reflecting recent chase transaction
  - This is done, but I have to wait 3-5 business days before twilio can send a text ...
- [ ] add parse result to google sheet
- [ ] mark email as "processed"
- [ ] sentry logs
- [ ] prompt user over sms to categorize item
- [ ] add docker build to cicd
... more in goal.md

### Tech
- gmail
- twilio
- docker / unraid / cloudflare (hosted at home)
- bun ts runtime
- lazygit

From [bmitchinson/typescript-template](https://github.com/bmitchinson/typescript-template)