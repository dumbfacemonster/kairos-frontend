import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from '../../styles/LastSearches.module.css';
import LastSearch from './LastSearch';

const moment = require('moment');

function LastSearches() {

    const search = useSelector((state) => state.search.value);
    
    

    if (!search.length) {
        //console.log('empty')
        return
    }
    const lastSearch = search.map((data, i) => {
        let date = moment(data.date).format("DD-MM-YYYY")
        //console.log(data.date)
        return <LastSearch key={i} activity={data.activity} area={data.area} date={date} />
    })


    return (
        <>
            <div className={styles.statusContainer}>
            <h2>Historique de vos recherches</h2>
                {lastSearch}
            </div>
        </>
    )
}

export default LastSearches;