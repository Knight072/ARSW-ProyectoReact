import { updateOtherPlayers } from './Player';
import { updateTreasures } from './Treasure';

export async function updateScene(scene, cellSize, player, socket) {

    const fetchGameState = () => {
        return new Promise((resolve, reject) => {
            socket.websocket.send(JSON.stringify({ getGameState: 'get' }));

            socket.websocket.onmessage = (event) => {
                try {
                    const parsedData = JSON.parse(event.data);
                    resolve(parsedData);
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                    reject(error);
                }
            };

            socket.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };
        });
    };

    try {
        const parsedData = await fetchGameState();
        const treasures = parsedData.treasures;
        const players = parsedData.players;
        if(!treasures || !players) return;
        updateOtherPlayers(scene, cellSize, player, players);
        updateTreasures(scene, cellSize, treasures);
    } catch (error) {
        console.error('Error fetching game state:', error);
    }
}


