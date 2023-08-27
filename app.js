//////////////////// 載入工具&檔案 ////////////////////

// express
const express = require('express');
const { engine } = require('express-handlebars');
const app = express();
const port = 3000;

// express-handlebars
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

// 載入靜態檔案
app.use(express.static('public'));
const restaurantList = require('./public/json/restaurant.json').results; // 載入餐廳資料

//////////////////// 路由設定&函式 ////////////////////

// 搜尋功能
function getRestaurants(searchType, keyword) {
  // 第一次進首頁尚未執行搜尋功能時，直接回傳整個餐廳清單
  if (!searchType || !keyword) return restaurantList;

  // 使用者執行搜尋功能時，根據關鍵字篩選餐廳清單
  keyword = keyword.toLowerCase();

  switch (searchType) {
    case 'all':
      return restaurantList.filter((restaurant) =>
        JSON.stringify(Object.values(restaurant))
          .toLowerCase()
          .includes(keyword)
      );
    case 'name':
      return restaurantList.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(keyword)
      );
    case 'category':
      return restaurantList.filter((restaurant) =>
        restaurant.category.toLowerCase().includes(keyword)
      );
  }
}

// index page (redirect to homepage)
app.get('/', (req, res) => {
  res.redirect('/restaurants');
});

// index page (displaying homepage)
app.get('/restaurants', (req, res) => {
  const searchType = req.query.searchType;
  const keyword = req.query.keyword?.trim();
  const restaurants = getRestaurants(searchType, keyword);

  const selected = {
    all: searchType === 'all' ? 'selected' : '',
    name: searchType === 'name' ? 'selected' : '',
    category: searchType === 'category' ? 'selected' : '',
  };

  /**
   * 原寫法：
   * 原本是把沒有搜尋結果的提示頁面分成不同檔案來渲染
   */
  // if (restaurants.length === 0) {
  //   res.render('noResult', { keyword, selected }); // 若沒有對應的搜尋結果，將顯示提示頁面
  // } else {
  //   res.render('index', { restaurants, keyword, selected });
  // }
  /**
   * 優化：
   * 在hbs檔中使用 Built-in Helper {{#if}} 則可直接使用同個HTML模板來渲染
   * 而不須額外分開成不同的檔案
   */
  res.render('index', { restaurants, keyword, selected });
});

// show page (showing restaurant detail)
app.get('/restaurants/:id', (req, res) => {
  const targetID = req.params.id;
  const restaurant = restaurantList.find(
    (restaurant) => restaurant.id === Number(targetID)
  );
  res.render('show', { restaurant });
});

// run server
app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
