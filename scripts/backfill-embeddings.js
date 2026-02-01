// Script to backfill embeddings for existing tickets
const tickets = [
  {
    id: "t001",
    title: "Login page crashes on mobile",
    content: "The login page consistently crashes when accessed from mobile browsers. Users report white screen and app becomes unresponsive.",
    source: "support"
  },
  {
    id: "t002", 
    title: "Add dark mode support",
    content: "Please add dark mode support to the dashboard. The bright white interface causes eye strain during night usage.",
    source: "github"
  },
  {
    id: "t003",
    title: "API rate limiting too aggressive",
    content: "The API rate limiting is blocking legitimate users. We're getting 429 errors even with normal usage patterns.",
    source: "email"
  },
  {
    id: "t004",
    title: "Dashboard loading is slow",
    content: "The main dashboard takes over 10 seconds to load. This is impacting our team's productivity significantly.",
    source: "forum"
  },
  {
    id: "t005",
    title: "Export to CSV feature request",
    content: "Need ability to export ticket data to CSV format for reporting and analysis purposes.",
    source: "email"
  },
  {
    id: "t006",
    title: "Two-factor authentication not working",
    content: "2FA codes are not being accepted. Users are locked out of their accounts even with correct codes.",
    source: "support"
  },
  {
    id: "t007",
    title: "Search functionality is broken",
    content: "The search bar returns no results even for known existing tickets. Makes it impossible to find previous issues.",
    source: "discord"
  },
  {
    id: "t008",
    title: "Mobile app keeps logging out",
    content: "The mobile application logs users out every few minutes. Session persistence seems to be broken.",
    source: "support"
  },
  {
    id: "t009",
    title: "Add keyboard shortcuts",
    content: "Would love to see keyboard shortcuts for common actions like creating tickets, assigning, and changing status.",
    source: "github"
  },
  {
    id: "t010",
    title: "Email notifications delayed",
    content: "Email notifications for new tickets are arriving hours late. Sometimes they don't arrive at all.",
    source: "twitter"
  },
  {
    id: "t011",
    title: "File upload fails on large files",
    content: "File uploads fail consistently for files larger than 10MB. Error message is not helpful for debugging.",
    source: "email"
  },
  {
    id: "t012",
    title: "User permissions confusing",
    content: "The user permission system is confusing. Admin roles don't have access to basic features they should have.",
    source: "forum"
  },
  {
    id: "t013",
    title: "Integration with Slack broken",
    content: "Slack integration stopped working after last update. No notifications are being sent to our channels.",
    source: "support"
  },
  {
    id: "t014",
    title: "Add bulk operations",
    content: "Need ability to perform bulk operations on tickets - bulk close, bulk assign, bulk tag, etc.",
    source: "github"
  },
  {
    id: "t015",
    title: "Performance degradation with many tickets",
    content: "As our ticket count grows beyond 1000, the system becomes noticeably slower. Queries take too long.",
    source: "email"
  }
];

async function backfillEmbeddings() {
  console.log('Starting backfill of embeddings for 15 tickets...');
  
  for (const ticket of tickets) {
    try {
      console.log(`Processing ticket ${ticket.id}: ${ticket.title}`);
      
      // Call the API to create a new ticket (this will generate embedding)
      const response = await fetch('https://feedback-hub.aniagg08.workers.dev/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: ticket.title,
          content: ticket.content,
          source: ticket.source,
          customer_name: 'Backfilled User',
          customer_email: `backfill-${ticket.id}@example.com`
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created embedding for ticket ${ticket.id}`);
      } else {
        console.error(`❌ Failed to create embedding for ticket ${ticket.id}:`, response.statusText);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error processing ticket ${ticket.id}:`, error.message);
    }
  }
  
  console.log('Backfill complete!');
}

backfillEmbeddings();
