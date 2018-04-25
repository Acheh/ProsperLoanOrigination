Summary

Prosper, founded in California in 2005 and opened to the public on February 2, 2006, is a peer-to-peer lending platform that allows people to invest in each other by connecting investors and borrowers through its service. The company faced a rocky start in their early years as the global financial crisis of 2007-2008 hit market and the Securities and Exchange Commission (SEC) issued a cease and desist order on November 24, 2008, requiring them to register their business under the Security Act. In July 2009, Prosper relaunch their business after having obtained SEC registration for its loans. In this visualization project, I want to show the company's history through its quarterly loan origination performance from it first opened to public to the last quarter of 2013. Hopefully, viewers can see how the SEC cease and desist order impacted Prosper and how the company moved forward from it.

Design

Version 1
https://bl.ocks.org/Acheh/raw/99ca099f4e2b83854b5551404a5f0821/

The comparative data of quarterly loan origination amount is displayed in a stacked bar chart based on loan grade (measured from HR - AA from the lowest to the highest based on the risk of borrower to go default on the loan).  Loan origination can be displayed in dollar amount or in percentage to help with grade composition comparison. Data can be filtered to display only a certain loan grade to see trend within the selected loan grade over the time. Finally, A horizontal guide line is provided as a mouse event to the graph to easily display the y-axis value (loan amount/percentage) at current cursor position.

Version 2
https://bl.ocks.org/Acheh/raw/19a72782788e3df91f468c110ffefaf8/

Based on feedback, it seems that viewer has a hard time finding out the exact y-value dispite the help from horintal guide line and apparently, a harder time finding out the y-value on certain loan grade without having to filter (only display that particular grade). As remedy, the graph is now equipt with a vertical guide line as a mouse event to display the x-axis (quarter period) at current cursor position. Further more, a table showing loan origination percentage, amount, count, and average amount in each grade and also in all grade (total) is displayed based on current cursor position. The inclusion of loan count and average loan amount was inspired by feedback questioning whether the increase in quarterly loan origination amount due to increase in loan count or increase in average loan amount instead. Therefore, the maximum values in each column is styled in bold for easy recognition on this matter.

Feedback

Version 1

MATTHEW - Udacity Mentor

Nice work Yasirah! I notice the growth in the $ amount of loans over time and the decline in low grade loans. I would be interested to know what other primary characteristics have changed over time. Have the loans gotten larger or are there more loans being given? I really like the exact hover feature that runs along the x-axis..

RINI OKTAVIA - Mathematics Lecturer at Syiah Kuala University, Banda Aceh

I notice that the colors of the bars  representing different grades of loans. I notice that each bar represent the amount of loans for each quarter of the year from 2006 to 2013. It is hard for me to differentiate the amount of each grade loan on a bar, but it is easier to realize that certain lian grade has a higher percentage of loan. This visualization  is good if I need to compare the amount of loans among grades.

Questions that arise about the data:
1. Where did the data come from? A Bank, A city, a county,  district, a state, a country or just from an organization who took loans every year 🙂
2. Who did took the loans? Individuals, organizations, financial institutions, or else?
3. What are the differences among loan grades. Did the grades determine the level of easyness to get the loans. I do not know anything about loan grades.
4. Is there any relationships between the interest rates of the loan with the amount of the loan? Did the data include the information about interest rates that were effective during each quarter
4. Did the data represent the amount of new loans for each quarter or the total amount of loans in each quarter. If the amount of loan is zero, does it mean there was no new loan or every loan owners have paid their debts?

I noticed there are few loans during the period of 2009-2011 but the loans start to increase from 2012-2013 with the amount similar to the loan amount from 2006-2009. There are a drastical increase of loan amount in 2013. It is hard to find a relationship among variables involved in this visualization. I did not see a clear pattern that will lead to a conclusion regarding the relationship.

The main take away is the comparison about the amount of loans among quarters from 2006-2013

PETER BAKKE - Fellow Udacian

Hello Yashirah! This looks terrific. I think the labeling is done well and is understandable. And the stacked bars are informative. What story is being told by the data? For example, what happened in 2013, 4th quarter? ... things went wild! What happened?

Version 2

MATTHEW - Udacity Mentor

Hey, this is a very creative way to display data! I like that you can get the summary and individual details. My takeaways are the same, although I wonder if average amount deserves it's own plot. (I think your % amounts need to be multiplied by 100 except on 'All). Great job!

PETER BAKKE - Fellow Udacian

Hi @ykrueng, brilliant. I think the additional of the table is perfect. It does a terrific job of backing up the visual above and I like how you even highlighted the largest loan grade in each quarter. I have no other comments than than well done! I imagine you stretched your knowledge about Tableau during this process, as well. Super!  :slightly_smiling_face:

