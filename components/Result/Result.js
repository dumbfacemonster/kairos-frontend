import { useSelector, useDispatch } from 'react-redux';
import { fillWithAllUserSearches } from '../../reducers/search';
import { addIdOfASearch, fillSearchesWithAllId } from '../../reducers/user';
import styles from '../../styles/Result.module.css';
import dynamic from 'next/dynamic';
import Graph from '../../components/Result/Graph';
import Show from '../../components/Result/Show';
import Histogram from '../../components/Result/Histogram';
import Comparaisonstatus from '../../components/Result/Comparaisonstatus';
import Selectedstatus from '../../components/Result/Selectedstatus';
import Zoom from '../../components/Result/Zoom';
import zoom from '../../datas/zoom';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import { Tooltip } from 'react-tooltip'


const MapComponent = dynamic(() => import('../../components/Result/MapComponent'), { ssr: false });

function Result() {

    const user = useSelector((state) => state.user.value);
    const dispatch = useDispatch()
    const url = process.env.NEXT_PUBLIC_BACK_ADDRESS
    const [selection, setSelection] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    console.log(`statut ${isOpen}`)

   // console.log(selection)

    // Variable search qui va enregistrer tout le reducer ou juste une recherche si on arrive sur la page avec son id en router.query

    let search
    const router = useRouter()
    const { searchid } = router.query

    const allSearches = useSelector((state) => state.search.value)
    //console.log(allSearches)

    if (searchid !== "companies") {
        search = allSearches.filter(e => e._id == searchid)
    }
    else {
        search = allSearches
    }

    console.log(user)
    console.log(search)


    useEffect(() => {
        const i = allSearches.length - 1

        // Si un utilisateur arrive sur la page avec un token et une recherche non enregistrée, fetch de la route pour enregistrer celle ci

        if (user.token && allSearches[i] !== "Aucune entreprise trouvée pour ce type d'activité dans ce secteur." && !allSearches[i]?._id /* && search[i] */) {
            fetch(`${url}/results/registerSearch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ search: allSearches[i], email: user.email })
            })
                .then(response => response.json())
                .then(data => {
                    dispatch(fillWithAllUserSearches(data.searches))
                    dispatch(fillSearchesWithAllId(data.allSearchesId))
                })
        }
    }, [])

    const i = search.length - 1
    console.log(search[i])

    // Affichage si pas d'entreprise trouvée 

    if (search[i] == "Aucune entreprise trouvée pour ce type d'activité dans ce secteur." || !search[i]) {
        return (
            <div className={styles.noResultPage}>
                <h2 className={styles.noResultSentence}>Aucune entreprise trouvée pour ce type d'activité dans ce secteur.</h2>
                <a href='/' > <h3 className={styles.newSearchSentence}>Voulez vous essayer une nouvelle recherche avec une autre zone ?</h3></a>
            </div>
        )
    }


 const scores = search[i].score[0];

 let score;

if (!scores) {
    score = 0;
}

else {
 score = scores.average_ca + scores.average_lifetime + scores.density_of_companies + scores.turnover;
}
console.log(score)

    let scoreStyle;

    if (score < 50) {
        scoreStyle = { 'color': '#CF0506' };
    }
    else if (score >= 50 && score < 75) {
        scoreStyle = { 'color': '#FD5C0D' };
    }
    else {
        scoreStyle = { 'color': '#1E8F28' };
    }

    const histogramData = search[i].top_status.map(status => ({
        status_name: status.status_name,
        companies_per_year: [
            { year: '2022', number: status.companies_per_year[2].number || 0 },
            { year: '2023', number: status.companies_per_year[1].number || 0 },
            { year: '2024', number: status.companies_per_year[0].number || 0 }
        ]
    }));




    let bottomPage
    if (!user.token) {
        bottomPage =
            <div className={styles.details}>
                <p>Connectez-vous pour obtenir plus d’informations sur les statuts, les démarches aini que des comparaisons !</p>
                <Link href="/login">
                    <a className={styles.ad}>Se connecter</a>
                </Link>
            </div>
    }
    if (user.token) {

        //fonction inverse data flow qui appelle Selectedstatus
        const callStatus = (data) => {
            setSelection(data)
            setIsOpen(true)
        }

        bottomPage =
            <div className={styles.bottomPageStyle}>
                <h3 className={styles.h3}>COMPARAISON DES STATUTS</h3>
                <div className={styles.statusTab}
                >
                    <Comparaisonstatus callStatus={callStatus} />
                </div>
                <div className={styles.faq}>
                    {isOpen ? (<Selectedstatus {...selection} />) : null}
                    <Zoom {...zoom} />
                </div>
            </div>
    }

    return (
        <div className={styles.resultPage}>
            <div className={styles.scoreContainer}>
                <p className={styles.score}
                >Score :<span style={scoreStyle}
                > {score}/100</span></p>
                <span className={styles.index}
                >Indice de viabilité</span>
                <span className={styles.hoverBulle}
                    id='infoBulle'>?</span>
                <Tooltip className={styles.bulle}
                    anchorSelect="#infoBulle" place="right">
                    L'indice de viabilité est calculé en fonction de la saturation du secteur et de l'évolution du chiffre d'affaire moyen.
                </Tooltip>
            </div>
            <div className={styles.firstResult}>
                <div className={styles.mapResult}>
                    <MapComponent />
                    <span className={styles.companiesNb}
                    > Nombre d'entreprises : {search[i].current_companies.length}</span>
                </div>
                <div className={styles.showResult}>
                    <Show />
                </div>
            </div>

            <div className={styles.detailledResult}>
                <h3 className={styles.h3}>DETAILS DE LA RECHERCHE</h3>
                <div className={styles.allGraphs}>
                    <div className={styles.caGraph}>
                <h3>Evolution du chiffre d'affaire moyen par année</h3>
                    <Graph />
                    </div>
                    <div className={styles.histo}>
                    <h3>Nombre d'entreprises par statut par année</h3>
                    <Histogram data={histogramData} />
                    </div>
                </div>
                {bottomPage}
            </div>
        </div>
    )

}
export default Result;