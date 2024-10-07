document.addEventListener('DOMContentLoaded', () => {
    const collectionItems = document.getElementById('collection-items');
    
    // Здесь можно загрузить данные коллекции и отобразить их
    const items = ['Предмет 1', 'Предмет 2', 'Предмет 3'];
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.textContent = item;
        collectionItems.appendChild(itemElement);
    });
});
