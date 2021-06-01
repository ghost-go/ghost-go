import React, {useEffect, useState, useRef} from 'react';
import {PaginationProps} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import {useQueryParam} from 'use-query-params';

import {fetchKifus, selectPlayers, fetchPlayers} from 'slices';
import {
  useDispatch,
  useTypedSelector,
  useOutsideClick,
  useGenericData,
} from 'utils';
import {
  FilterButton,
  KifuCard,
  Tag,
  Spinner,
  Pagination,
} from 'components/common';
import {} from 'slices/tagSlice';

const Kifus = () => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [kifuList, setKifuList] = useState([]);
  const [filter, setFilter] = useState(false);
  const [players] = useGenericData(
    useTypedSelector(state => selectPlayers(state))
  );
  const kifus = useTypedSelector(state => state.kifus);
  const [page = '1', setPage] = useQueryParam('page');
  const [q = '', setQ] = useQueryParam('q');
  const [playerParam = 'all', setPlayerParam] = useQueryParam<string>('player');

  useOutsideClick(ref, () => {
    if (filter) setFilter(false);
  });

  const handlePaginationChange = (
    e: React.MouseEvent,
    data: PaginationProps
  ) => {
    setPage(data.activePage);
  };

  useEffect(() => {
    dispatch(fetchPlayers());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      player: playerParam,
      page,
      q,
    };
    dispatch(fetchKifus({params}));
  }, [page, q]);

  let items: any = [];
  if (kifus && kifus.status === 'succeeded') {
    items = kifus.payload.data.map((k: any) => (
      <KifuCard key={`k-${k.id}`} kifu={k} />
    ));
  }

  return (
    <>
      <div className="flex flex-row items-center px-3 py-1 lg:px-1 lg:py-2">
        <FilterButton
          onClick={() => {
            setFilter(!filter);
          }}
        />
        <div className="text-base ml-4">Player: {playerParam}</div>
        {playerParam !== 'all' && (
          <div>
            <button
              onClick={() => {
                setPlayerParam('all');
              }}
              className="text-base underline ml-4"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
      <div
        ref={ref}
        className={`absolute transition transform origin-top-left ${
          filter
            ? 'scale-100 opacity-1'
            : 'scale-50 opacity-0 pointer-events-none'
        } bg-white shadow-md rounded-sm max-w-full lg:max-w-2xl z-10 p-2 border mx-2.5 lg:mx-1`}
      >
        <div>
          <div className="block font-semibold text-gray-400 mb-2">
            Top Players(Top 30 from go ratings)
          </div>
          <Tag
            key={'t-all'}
            onClick={() => {
              setPlayerParam('all');
              setFilter(false);
            }}
          >
            all
          </Tag>
          {players &&
            players.data.map(({attributes: {name, en_name}}: any) => (
              <Tag
                key={`p-${en_name}`}
                onClick={() => {
                  setPlayerParam(en_name);
                  setFilter(false);
                }}
              >
                {en_name}
              </Tag>
            ))}
        </div>
      </div>
      {kifus.status === 'loading' && items.length === 0 && (
        <div className="mt-20">
          <Spinner />
        </div>
      )}
      {items.length > 0 && (
        <>
          <div className="grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 grid-cols-2 lg:gap-2 gap-1 lg:pr-2 lg:pl-0 p-2">
            {items}
          </div>
          <div className="mt-5">
            <Pagination
              defaultActivePage={page}
              ellipsisItem={undefined}
              totalPages={kifus.headers['total-pages']}
              onPageChange={handlePaginationChange}
            />
          </div>
        </>
      )}
      {kifus.status === 'succeeded' && items.length === 0 && (
        <div className="text-center">
          <div className="mt-10 text-2xl">No Data</div>
          <button
            onClick={() => {
              setPlayerParam('all');
            }}
            className="underline p-5 mt-2"
          >
            Clear Filters
          </button>
          <button
            onClick={() => {
              router.back();
            }}
            className="underline p-5"
          >
            Go back
          </button>
        </div>
      )}
    </>
  );
};

export default Kifus;
