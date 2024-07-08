import { DependencyContainer } from "tsyringe";

import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

class RemoveTimeGateFromQuests implements IPostDBLoadMod
{
    private logger: ILogger;

    public preAkiLoad(container: DependencyContainer): void
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");
    }

    public postDBLoad(container: DependencyContainer): void 
    {
        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.logger = container.resolve<ILogger>("WinstonLogger");

        // Get all the in-memory json found in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();

        const quests = tables.templates.quests;

        for (const quest in quests) 
        {
            const conditionsAOS = quests[quest].conditions.AvailableForStart;

            if (conditionsAOS !== undefined) 
            {
                for (const condition in conditionsAOS)
                {
                    if (conditionsAOS[condition]?.conditionType === "Quest" && conditionsAOS[condition]?.availableAfter > 0)
                    {
                        conditionsAOS[condition].availableAfter = 0;
                        this.logger.logWithColor(`${quests[quest].QuestName} Time requirement removed.`, LogTextColor.GREEN);
                    }
                }
            }
        }
    }
}

module.exports = { mod: new RemoveTimeGateFromQuests() }