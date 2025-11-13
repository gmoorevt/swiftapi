# SwiftAPI Quick Start Guide

> **5-Minute Fast Track** - Get up and running with SwiftAPI immediately

## 🚀 Your First API Request (2 minutes)

### Step 1: Launch SwiftAPI
Open SwiftAPI on your computer.

### Step 2: Enter a URL
In the URL field, type:
```
https://api.github.com/users/octocat
```

### Step 3: Click Send
Click the blue **Send** button (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 4: View the Response
See the JSON response in the bottom panel!

**🎉 Congratulations!** You just made your first API request!

---

## ⚡ Essential Features (3 minutes)

### Save Your Request
1. Click the **Save** button
2. Name it: "GitHub User"
3. Create a collection: "My First Collection"
4. Click **Save Request**

✅ Now you can reload it anytime from the Collections sidebar!

### Use Different HTTP Methods
1. Click the method dropdown (currently "GET")
2. Try POST, PUT, DELETE for different actions
3. Use the Body tab to send data with POST/PUT

### Switch Environments
1. Click the Environment dropdown (top-right)
2. Create "Development" and "Production" environments
3. Use `{{variables}}` in URLs to switch easily

---

## 🎯 Common Tasks

### Test a POST Endpoint
```
URL: https://httpbin.org/post
Method: POST
Body: {"name": "Test User", "email": "test@example.com"}
```

### Add Headers
1. Click **Headers** tab
2. Add: `Authorization` = `Bearer your-token-here`
3. Add: `Content-Type` = `application/json`

### Create a Mock Server
1. Click **Mock Servers** in sidebar
2. Click **Create Mock Server**
3. Name: "Test API", Port: 3001
4. Add endpoint: GET `/users` returns your test data
5. Click **Start**
6. Test at: `http://localhost:3001/users`

---

## 💡 Pro Tips

- **Keyboard Shortcut**: `Ctrl/Cmd + Enter` to send
- **Save Time**: Save common requests in collections
- **Stay Organized**: Use clear names for requests and collections
- **Test Safely**: Use environments to avoid testing production

---

## ❓ Need Help?

- Full Tutorial: See [TRAINING_TUTORIAL.md](TRAINING_TUTORIAL.md)
- Documentation: Visit [User Guide](../USER_GUIDE.md)
- Support: [GitHub Issues](https://github.com/gmoorevt/swiftapi/issues)

---

**Ready for more?** Check out the [complete training tutorial](TRAINING_TUTORIAL.md) for in-depth learning!
