/* =========================================================
   NEXTGEN DESK TRAINING — course content
   Edit this file to change lessons.

   Each lesson:
     title        (required)
     tag          (optional)  small label, e.g. "Watch first"
     description  (optional)  notes shown under the video
     driveId      (optional)  the Google Drive file ID of the video
                              (the long code in .../file/d/THIS-PART/view)
   A lesson with an empty driveId shows a "Video coming soon" screen.

   Q&A videos (window.COURSE.qa, below the lessons) work the same way,
   but use a Loom video instead of Google Drive:
     title        (required)
     loomId       the code at the end of the Loom link
                  (loom.com/share/THIS-PART)
   Q&A videos are extra help: they don't count toward course progress.
   ========================================================= */

window.COURSE = {
  id: "nextgen-leads-training",
  title: "NextGen Desk Training",
  lessons: [
    { title: "Quick Overview",                        tag: "Watch first",     driveId: "1qQEz5qoV_3n32UAWFaA5zP4oIcOwVdmW" }, // updated video (replaced overview.mp4)
    { title: "Settings Set Up",                       tag: "Must watch",      driveId: "10-vanGIuQKbT7UuWVKWMqdpxrTpFIZlB" }, // settings set up.mp4
    { title: "New Leads Set Up (Facebook Ads)",                               driveId: "1CLoPS9DeNZ6utCSF9BvuvT-jaUp_k45v" }, // new leads set up.mp4
    { title: "Reactivation, Upsell & Referrals",      tag: "Implement these", driveId: "1epfqhmT2Q1FyHAktOp3nF62lNSZzSutX" }, // updated video (replaced Reactivation, Upsell....mp4)
    { title: "How To Import Leads",                                           driveId: "1UjAQg4OgPLfH99Y9UokZvRdYpTEIjhX8" }, // how to import leads.mp4
    { title: "Automation Training",                                           driveId: "1yn2f5rHhQeqa6UI2K5tXeTZdA55ydxJ3" }, // automation training.mp4
    { title: "Which Automations Should You Turn On?",                         driveId: "1eRnQeD1IhztH6v6kQR64MA27twVn2ovi" }, // updated video (replaced which automation should you....mp4)
    { title: "Pest Control AI Setup",                                         driveId: "1tNqaa8ajbP6Y0tlXXpGSe_Z3zDalQyZd" }, // pest control ai setting up.mp4
    { title: "Lead Management",                                               driveId: "1jmb1FG3QMNp5zLmBN8c9x_Pwn8w70LXZ" }, // lead management.mp4
    { title: "Social Planner: How To Post From One Platform",                 driveId: "1vYSZDAfFckq4HVtjNBtgo2OsB9OpLo7o" }, // social plannerr.mp4
    { title: "Common Issues and Solutions",
      description: "Links mentioned in this video will be added here.",      driveId: "1W9OvzY8XPnnurVDVMDatdthB2NmVxV04" }  // common issues.mp4
  ],
  qa: [
    { title: "How To Quickly Check That New Lead Automations Are Set Up Properly", description: "Use this when a client says their automations aren't working.", loomId: "b0a4c3385bd944b4a407eebec179b6f8" },
    { title: "How To Add Users",                                                    loomId: "28ff5b3b4bba435fa5d3ae63684e63f9" },
    { title: "Meta Leads Not Syncing",                                              loomId: "85b8ac05508f432b9bc1bbbd1b176a84" },
    { title: "Phone Settings / Forwarding Issues",                                  loomId: "099df18e9278490fa86a03204e109ee5" },
    { title: "How To Connect Leads From Other Platforms",                           loomId: "032fe3c31d6c41b69396678b0f035f97" },
    { title: "How To Remove Leads From Automations",                                loomId: "9be130a122d34261a577a57577d07e78" },
    { title: "How To Send Bulk Messages / Emails To Your Customer List",            loomId: "2b5b4ffb11604f628c01ffc9895db278" }
  ]
};
