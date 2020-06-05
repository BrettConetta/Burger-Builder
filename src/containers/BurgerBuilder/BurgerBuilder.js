import React, { Component } from 'react';
import axios from '../../axios-orders';
import Aux from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from './../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary'
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
	salad: 0.50,
	cheese: 0.40,
	meat: 1.30,
	bacon: 0.70,
	tomato: 0.50,
	vegan: 2.05,
	fish: 1.65
};

class BurgerBuilder extends Component {
	state = {
		ingredients: null,
		totalPrice: 4.0,
		purchasable: false,
		purchasing: false,
		loading: false,
		error: false
	}

	componentDidMount() {
		console.log(this.props.location);
		axios.get('https://react-my-burger-945c2.firebaseio.com/ingredients.json')
			.then(response => {
				this.setState({ingredients: response.data});
			})
			.catch(error => {
				this.setState({error: true})
			});
	}

	updatePurchaseState (ingredients){
		const sum = Object.keys(ingredients).map(igKey => {
			return ingredients[igKey];
		}).reduce((sum, el) => {
			return sum + el;
		}, 0);
		this.setState({purchasable: sum > 0})
	}

	addIngredientHandler = type => {
		const oldCount = this.state.ingredients[type];
		const updatedCount = oldCount + 1;
		const updatedIngredients = {
			...this.state.ingredients
		};
		updatedIngredients[type] = updatedCount;

		const priceAddition = INGREDIENT_PRICES[type];
		const oldPrice = this.state.totalPrice;
		const newPrice = oldPrice + priceAddition;

		this.setState({totalPrice: newPrice, ingredients: updatedIngredients});
		this.updatePurchaseState(updatedIngredients);


	}

	removeIngredientHandler = type => {
		const oldCount = this.state.ingredients[type];
		const updatedCount = oldCount - 1;
		if(oldCount <= 0)
		{
			return;
		}
		const updatedIngredients = {
			...this.state.ingredients
		};
		updatedIngredients[type] = updatedCount;

		const priceReduction = INGREDIENT_PRICES[type];
		const oldPrice = this.state.totalPrice;
		const newPrice = oldPrice - priceReduction;

		this.setState({totalPrice: newPrice, ingredients: updatedIngredients});
		this.updatePurchaseState(updatedIngredients);
	}

	purchaseHandler = () => {
		this.setState({purchasing: true});
	}

	purchaseCancelHandler = () => {
		this.setState({purchasing: false});
	} 

	purchaseContinueHandler = () => {
		//alert('You continue');
		// this.setState({loading: 'true'});
		// const order = {
		// 	ingredients: this.state.ingredients,
		// 	price: this.state.totalPrice.toFixed(2),
		// 	customer: {
		// 		name: 'Brett Conetta',
		// 		address: {
		// 			street: '86 Beechtree Dr',
		// 			city: 'Toms River',
		// 			state: 'New Jersey',
		// 			zipcode: '08753',
		// 			country: 'United States'
		// 		},
		// 		email: 'brettconetta76@gmail.com'
		// 	},
		// 	deliveryMethod: 'fastest'
		// }
		// axios.post('/orders.json', order)
		// .then(response => {
		// 	this.setState({loading: true, purchasing: false});
		// })
		// .catch(error => {
		// 	this.setState({loading: false, purchasing: false});
		// });
		const queryParams = [];
		for(let i in this.state.ingredients) {
			queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]));
		}
		queryParams.push('price=' + this.state.totalPrice);
		const queryString = queryParams.join('&');
		console.log(queryParams);
		console.log(queryString);
		this.props.history.push({
			pathname: '/checkout',
			search: '?' + queryString
		});
	}

	render(){
		const disbaledInfo = {
			...this.state.ingredients
		};
		for (let key in disbaledInfo) {
			disbaledInfo[key] = disbaledInfo[key] <= 0
		}
		let orderSummary = null
								
		let burger = this.state.error ? <p>Ingredients can't be loaded</p> : <Spinner/>
		if(this.state.ingredients) {
			burger = (
				<Aux>
					<Burger ingredients={this.state.ingredients}/>
					<BuildControls 
						ingredientAdded={this.addIngredientHandler}
						ingredientRemoved={this.removeIngredientHandler}
						disabled={disbaledInfo}
						purchasable={this.state.purchasable}
						ordered={this.purchaseHandler}
						price={this.state.totalPrice}
					/>
				</Aux>
			)
			orderSummary = <OrderSummary 
								price={this.state.totalPrice}
								ingredients={this.state.ingredients} 
								cancelled={this.purchaseCancelHandler} 
								continued={this.purchaseContinueHandler}/>
		}

		if(this.state.loading) {
			orderSummary = <Spinner/>
		}
		
		return(
			<Aux>
				<Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
					{orderSummary}
				</Modal>
				{burger}
					
				
			</Aux>
		);
		
	}
}

export default withErrorHandler(BurgerBuilder, axios);