#Использование
На стороне клинта во всех "входных" (обычно: footer, header) страницах необходимо вставить следующий код:
```html
  	<script src="https://cdn.jsdelivr.net/gh/gt4u/utm@v1.0.0/script.min.js"></script>
	<script>
		(new GT4Utm).init()
	</script>
```
Время записи cookies по умолчанию равно 3 часам. 
Для изменения данного параметра необходимо передать другое значение при создании экземпляра класса `GT4Utm`:
```js
    let utm = new GT4Utm({
        expires: 6 * 60 * 60
    })
    utm.init();
``` 