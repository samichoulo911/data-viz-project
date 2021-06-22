import * as d3 from 'd3'

function cleanPlayerNames(data) {
    for (const element of data) {
        element.PlayerName = element.PlayerName.slice(0, element.PlayerName.indexOf('\\'));
    }
}

function getPlayersWithMostGoals(data, playerCount) {
    return data.sort((first, second) => {
        return second.Goals - first.Goals;
    }).slice(0, playerCount);
}

function mergeSeasons(data) {
    const nanAttributes = ['Season'];
    const attributesToKeep = ['Age'];
    const attributesToKeepAndAdd = [
        'RedCards',
        'YellowCards',
        'MatchPlayed',
        'Goals',
        'Shots',
        'ShotsOnTarget',
        'FreeKicks',
        'Assists',
        'AssistedShot',
        'PassAttempted',
        'PassCompleted',
        'MinutesPlayed'
    ];
    
    const mergedData = new Map();
    for (const value of data) {
        let cleanedUpValue = {};

        for (const attr of nanAttributes) {
            cleanedUpValue[attr] = value[attr];
        }
        
        for (const attr of attributesToKeep.concat(attributesToKeepAndAdd)) {
            const stat = isNaN(+value[attr]) ? 0 : +value[attr];
            cleanedUpValue[attr] = stat;
        }

        if (!mergedData.has(cleanedUpValue.Season)) {
            mergedData.set(cleanedUpValue.Season, cleanedUpValue);
        } else {
            const currentStat = mergedData.get(cleanedUpValue.Season);
            let mergedSeason = {};
            for (const attr of nanAttributes.concat(attributesToKeep)) {
                mergedSeason[attr] = cleanedUpValue[attr];
            }

            for (const attr of attributesToKeepAndAdd) {
                mergedSeason[attr] = cleanedUpValue[attr] + currentStat[attr];
            }
            mergedData.set(cleanedUpValue.Season, mergedSeason);
        }
    }
    return Array.from(mergedData).map(([key, value]) => value);
}

function computeDerivedStats(data) {
    for (const season of data) {
        season['GoalsPer90Minutes'] = season['Goals'] / season['MinutesPlayed'] * 90;
        season['AssistsPer90Minutes'] = season['Assists'] / season['MinutesPlayed'] * 90;
        season['ShotsOnTargetPer90Minutes'] = season['ShotsOnTarget'] / season['MinutesPlayed'] * 90;
    }
    return data;
}

export async function getLiguaStats() {
    const standardStatsFilename = window.location.origin + '/data/standard_stats_la_ligua.csv';
    const shootingStatsFilename = window.location.origin + '/data/shooting_stats_la_ligua.csv';
    const passingStatsFilename = window.location.origin + '/data/passing_stats_la_ligua.csv';
    const standardStats = await d3.csv(standardStatsFilename);
    const shootingStats = await d3.csv(shootingStatsFilename);
    const passingStats = await d3.csv(passingStatsFilename);

    const mergedData = [];
    for (const playerStandardStats of standardStats) {
        const playerShootingStats = shootingStats.find(element => element.PlayerName === playerStandardStats.PlayerName);
        const playerPassingStats = passingStats.find(element => element.PlayerName === playerStandardStats.PlayerName);
        mergedData.push(Object.assign({}, playerStandardStats, playerShootingStats, playerPassingStats));
    }
    const topScoringPlayers = getPlayersWithMostGoals(mergedData, 10);
    cleanPlayerNames(topScoringPlayers);
    return topScoringPlayers;
}

export async function getBenzemaHistoricalStats() {
    const standardStatsFilename = window.location.origin + '/data/benzema_standard_stats_historical_values.csv';
    const shootingStatsFilename = window.location.origin + '/data/benzema_shooting_stats_historical_values.csv';
    const passingStatsFilename = window.location.origin + '/data/benzema_passing_stats_historical_values.csv';
    const standardStats = await d3.csv(standardStatsFilename);
    const shootingStats = await d3.csv(shootingStatsFilename);
    const passingStats = await d3.csv(passingStatsFilename);

    const mergedStats = [];
    for (let i = 0; i < standardStats.length; i++) {
        mergedStats.push(Object.assign({}, standardStats[i], shootingStats[i], passingStats[i]))
    }

    const mergedSeasons = mergeSeasons(mergedStats);

    return computeDerivedStats(mergedSeasons);
}

export async function getGiroudHistoricalStats() {
    const standardStatsFilename = window.location.origin + '/data/giroud_standard_stats_historical_values.csv';
    const shootingStatsFilename = window.location.origin + '/data/giroud_shooting_stats_historical_values.csv';
    const passingStatsFilename = window.location.origin + '/data/giroud_passing_stats_historical_values.csv';
    const standardStats = await d3.csv(standardStatsFilename);
    const shootingStats = await d3.csv(shootingStatsFilename);
    const passingStats = await d3.csv(passingStatsFilename);

    const mergedStats = []
    for (let i = 0; i < standardStats.length; i++) {
        mergedStats.push(Object.assign({}, standardStats[i], shootingStats[i], passingStats[i]))
    }

    const mergedSeasons = mergeSeasons(mergedStats);

    return computeDerivedStats(mergedSeasons);
}
