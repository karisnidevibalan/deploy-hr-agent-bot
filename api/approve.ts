import type { VercelRequest, VercelResponse } from '@vercel/node';

// Dummy approval handler for demonstration. Replace with real logic as needed.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id, action, token } = req.query;

  if (!id || !action || !token) {
    return res.status(400).send('<h1>Invalid Request</h1><p>Missing record ID, action, or token.</p>');
  }

  // Simple token validation (for demo: token must match id)
  if (token !== id) {
    return res.status(403).send('<h1>Unauthorized</h1><p>Invalid token.</p>');
  }

  // Simulate approval/rejection logic
  if (action === 'approve') {
    // TODO: Integrate with Salesforce or your backend to approve the record
    return res.send(`<h1>Request Approved</h1><p>Record ID: ${id} has been approved.</p>`);
  } else if (action === 'reject') {
    // TODO: Integrate with Salesforce or your backend to reject the record
    return res.send(`<h1>Request Rejected</h1><p>Record ID: ${id} has been rejected.</p>`);
  } else {
    return res.status(400).send('<h1>Invalid Action</h1><p>Action must be approve or reject.</p>');
  }
}
