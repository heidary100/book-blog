---
title: "My Application Is All API Calls"
book: legacy-code
chapter: 15
date: 2026-10-04
summary: "An application that looks like nothing but library calls still hides a kernel of real logic; identify the computational core, separate it from thin API wrappers, and get it under test — skinning and wrapping the API when you need full isolation, extracting responsibilities when the API is complicated."
tags: [legacy-code, decoupling, refactoring, testing]
---

> Build, buy, or borrow — and then one day the application is nothing but repeated calls to someone else's library. It looks trivially testable, and that is the trap: the code is "really simple," we're "just calling a method here and there," so what can go wrong? Plenty of legacy projects started from those humble beginnings. The remedy is to find the small kernel of your own logic, peel it away from the API calls, and get it under test — skinning and wrapping the API when you need complete isolation, extracting responsibilities when the API is too complicated to wrap.

## The big idea

Integrating code you can't change is a legitimate choice — you weigh how stable it is, whether it is sufficient, how easy it is to use — but the resulting application looks like calls into someone else's library, and the immediate temptation is to conclude that tests aren't needed because the code is "really simple." Many legacy projects started from those humble beginnings. The code grows and grows; the areas that don't touch an API end up embedded in a patchwork of untestable code; and every change requires running the whole application to check that it still works. That is the central dilemma of the legacy system programmer: changes are uncertain, you didn't write all the code, but you have to maintain it.

API-intensive systems are harder to deal with than home-grown ones for two structural reasons. First, the structure is invisible: all you can see are the API calls, so anything that would have been a hint at a design just isn't there. Second, you don't own the API: you can't rename interfaces, classes, and methods to make things clearer, or add methods to make behavior available to different parts of the code.

The claim that carries the chapter: "nearly every system has some core logic that can be peeled away from API calls." When a system looks like nothing but API calls, imagine it is one big object and apply the responsibility-separation heuristics of Chapter 20 — even if you can't move to a better design immediately, the act of identifying the responsibilities makes better decisions possible as you move forward.

## Section by section

The running example is a deliberately poorly written mailing list server built on the JavaMail API. `main` parses eight command-line arguments, opens a roster file, then loops forever: sleep for an interval, wake, connect to a POP3 store, fetch messages, forward each one to the roster, mark it deleted. It is a small piece of code, but it isn't very clear — hard to find lines that don't touch an API.

The first step is to identify the **computational core**: what is this chunk of code really doing for us? Writing a brief description helps: it reads configuration from the command line and a list of e-mail addresses from a file; it checks for mail periodically; when it finds mail, it forwards it to each address in the file (senders must be on the roster). The description exposes work that is not input and output. A thread sleeps and wakes on an interval. And forwarding is not resending the incoming message: the code builds a new message, sets the from/reply-to/recipient fields, prefixes the subject with the `[list]` marker when it is missing, adds an X-Loop header, and copies the content over. So there is real work here, buried in API calls.

Separating responsibilities yields four needs:

1. something that can receive each incoming message and feed it into the system;
2. something that can just send out a mail message;
3. something that can make new messages for each incoming message, based on the roster of list recipients;
4. something that sleeps most of the time but wakes up periodically to see if there is more mail.

They are not equally tied to the mail API. Responsibilities 1 and 2 are definitely tied to it. Responsibility 3 is trickier: the message classes it needs are part of the API, but it can be tested independently by creating dummy incoming messages. Responsibility 4 has nothing to do with mail at all — it just needs a thread that wakes at intervals.

The target design (Figure 15.1) separates them. **ListDriver** owns the sleep/wake thread and checks for mail by telling the **MailReceiver** to check; the MailReceiver reads the mail and sends the messages one by one to a **MessageForwarder**, which creates a message for each list recipient and mails it using the **MailSender**. The `MessageProcessor` and `MailService` interfaces are what make the classes independently testable — a `FakeMailSender` implementing `MailService` lets the MessageForwarder run in a test harness without actually sending mail.

The win here is layering, not purity. **MessageForwarder** is the piece most independent of the mechanics of sending and receiving mail, yet it still uses the message classes of the JavaMail API — there are not many places for plain old Java objects in this system. But factoring into four classes and two interfaces puts the primary logic of the mailing list under test, where in the original code it was buried and unapproachable. It is nearly impossible to break a system into smaller pieces without ending up with some that are "higher level" than others.

Two named ways to move an existing API-littered system toward such a design:

- **Skin and Wrap the API**: make interfaces that mirror the API as closely as possible and create wrappers around the library classes, using **Preserve Signatures** to minimize mistakes. The wrappers delegate to the real API in production code, and fakes stand in during test. Good when the API is relatively small, when you want to completely separate dependencies on a third-party library, or when you have no tests and can't write them because you can't test through the API. The payoff is that all of your code is under test except a thin layer of delegation from wrapper to real API.

- **Responsibility-Based Extraction**: identify responsibilities in the code and extract methods for them. Good when the API is more complicated and you have a tool that provides safe extract-method support — or confidence that you can do the extractions safely by hand.

The mailing list shows both the limits and the choice. To break the dependency on `Transport`, you would wrap it — but the code never creates the `Transport`; it gets it from `Session`, and `Session` is a final class, so it can't be wrapped that way. The mailing list code is really a poor candidate for skinning: the API is relatively complicated. Without refactoring tools, skinning would still have been the safest course; with them, extraction wins. The send path extracted into its own class:

```java
public class MailSender {
    private HostInformation host;
    private Roster roster;

    public void sendMessage(Message message) throws Exception {
        Transport transport = getSMTPSession().getTransport("smtp");
        transport.connect(host.smtpHost, host.smtpUser, host.smtpPassword);
        transport.sendMessage(message, roster.getAddresses());
    }

    private Session getSMTPSession() {
        Properties props = new Properties();
        props.put("mail.smtp.host", host.smtpHost);
        return Session.getDefaultInstance(props, null);
    }
}
```

Choosing between the techniques is tricky. Skin and Wrap is more work, but the need to isolate yourself from third-party libraries comes up often (Chapter 14 covers it in detail). Responsibility-Based Extraction has a subtle cost: to extract a method with a higher-level name you may pull some of your own logic out along with the API code — the code then depends on higher-level interfaces rather than low-level API calls, but you might not be able to get the extracted code under test. In practice many teams use both techniques: a thin wrapper for testing, and a higher-level wrapper to present a better interface to their application.

## Key terms

- **Computational core**: the kernel of a system's own logic — what the code really does for you beneath the API calls; the thing to identify first, describe in one sentence, and get under test.
- **Skin and Wrap the API**: mirror a third-party API with your own interfaces and wrap the library classes behind them; wrappers delegate in production, fakes run in tests. Best for small APIs and full dependency isolation.
- **Responsibility-Based Extraction**: identify responsibilities in API-littered code and extract methods for them, relying on safe extract-method tooling; the code comes to depend on higher-level interfaces, though extracted pieces may resist testing.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
