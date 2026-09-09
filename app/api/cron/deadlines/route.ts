import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

// Vercel Cron Secret check (optional but good practice)
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch Users
    const usersRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/data?action=getUsers`);
    const users = await usersRes.json();

    // 2. Fetch Workbook
    const workbookRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/data?action=getWorkbook`);
    const workbook = await workbookRes.json();

    if (!Array.isArray(users) || !Array.isArray(workbook)) {
      throw new Error("Failed to load data");
    }

    // 3. Process Deadlines
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let messagesSent = 0;

    for (const task of workbook) {
      if (task.status === 'Completed' || task.status === 'Cancelled' || !task.assigned) continue;

      const assignees = (task.assigned as string).split(',').map(s => s.trim());
      
      const checkDeadline = (dateStr: string, name: string, targetRoles: string[]) => {
        if (!dateStr) return;
        const taskDate = new Date(dateStr);
        taskDate.setHours(0, 0, 0, 0);

        const diffTime = taskDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1 || diffDays < 0) {
          const isOverdue = diffDays < 0;
          const emoji = isOverdue ? '🚨' : '⚠️';
          const urgency = isOverdue ? `<b>OVERDUE by ${Math.abs(diffDays)} days!</b>` : `<b>Due Tomorrow!</b>`;

          const formattedTime = new Date(dateStr).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'});
          const msg = `${emoji} <b>Deadline Alert</b>
<b>Task:</b> <i>${task.name}</i>
<b>Client:</b> ${task.client || 'N/A'}
<b>Stage:</b> ${name} (${formattedTime})
<b>Status:</b> ${urgency}`;

          // Find users who should get this alert
          for (const assignee of assignees) {
            const user = users.find(u => u.Name === assignee);
            if (!user || !user.TelegramChatID) continue;

            // Check if user role matches the target roles for this deadline
            let userCares = false;
            try {
               const uRoles = typeof user.Roles === 'string' ? JSON.parse(user.Roles) : user.Roles;
               const roleArr = Array.isArray(uRoles) ? uRoles : [];
               
               // Admins get everything, or if they have a specific role
               if (roleArr.some((r: string) => r.includes('ADMIN') || targetRoles.some(tr => r.includes(tr)))) {
                 userCares = true;
               }
            } catch (e) { }

            if (userCares) {
              sendTelegramMessage(user.TelegramChatID.toString(), msg);
              messagesSent++;
            }
          }
        }
      };

      // Map deadlines to the roles that care about them
      checkDeadline(task.scriptDate, 'Scripting', ['CONTENT WRITER', 'COPYWRITER']);
      checkDeadline(task.shootDate, 'Shooting', ['VIDEOGRAPHER', 'DIRECTOR']);
      checkDeadline(task.editDate, 'Editing (V1)', ['EDITOR', 'GRAPHIC DESIGNER']);
      checkDeadline(task.finalDate, 'Final Delivery', ['EDITOR', 'GRAPHIC DESIGNER', 'PAGE MANAGER']);
    }

    return NextResponse.json({ success: true, messagesSent });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Cron execution failed" }, { status: 500 });
  }
}
